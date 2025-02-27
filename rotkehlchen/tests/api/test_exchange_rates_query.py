from http import HTTPStatus
from typing import TYPE_CHECKING

import pytest
import requests

from rotkehlchen.constants.assets import A_ETH, A_EUR, A_KRW, A_USD
from rotkehlchen.fval import FVal
from rotkehlchen.tests.utils.api import (
    api_url_for,
    assert_error_response,
    assert_proper_response,
    assert_proper_sync_response_with_result,
)

if TYPE_CHECKING:
    from rotkehlchen.api.server import APIServer


@pytest.mark.parametrize('start_with_logged_in_user', [False])
def test_querying_exchange_rates(rotkehlchen_api_server: 'APIServer') -> None:
    """Make sure that querying exchange rates works also without logging in"""
    # Test with empty list of currencies
    response = requests.get(
        api_url_for(rotkehlchen_api_server, 'exchangeratesresource'),
        json={'currencies': []},
    )
    assert_error_response(
        response=response,
        contained_in_msg='"currencies": ["List cant be empty"]',
        status_code=HTTPStatus.BAD_REQUEST,
    )

    def assert_okay(response: requests.Response) -> None:
        """Helper function for DRY checking below assertions"""
        assert_proper_response(response)
        json_data = response.json()
        assert json_data['message'] == ''
        result = json_data['result']
        assert len(result) == 4
        assert FVal(result['EUR']) > 0
        assert FVal(result['USD']) > 0
        assert FVal(result['KRW']) > 0
        assert FVal(result['ETH']) > 0

    # Test with some currencies, both JSON body and query parameters
    data = {'currencies': ['EUR', 'USD', 'KRW', 'ETH']}
    response = requests.get(
        api_url_for(rotkehlchen_api_server, 'exchangeratesresource'), json=data,
    )
    assert_okay(response)
    # This serves as a test that a list of parameters works with query args too
    response = requests.get(
        api_url_for(rotkehlchen_api_server, 'exchangeratesresource') + '?currencies=' +
        ','.join(data['currencies']),
    )
    result = assert_proper_sync_response_with_result(response)
    expected_currencies = [A_EUR, A_USD, A_KRW, A_ETH]
    assert len(result) == len(expected_currencies)
    for currency in expected_currencies:
        assert FVal(result[currency.identifier]) > 0


@pytest.mark.parametrize('start_with_logged_in_user', [False])
def test_querying_exchange_rates_errors(rotkehlchen_api_server: 'APIServer') -> None:
    """Make sure that querying exchange rates with wrong input is handled"""

    # Test with invalid type for currency
    data = {'currencies': [4234324.21], 'async_query': False}
    response = requests.get(
        api_url_for(rotkehlchen_api_server, 'exchangeratesresource'), json=data,
    )
    assert_error_response(
        response=response,
        contained_in_msg='Tried to initialize an asset out of a non-string identifier',
        status_code=HTTPStatus.BAD_REQUEST,
    )

    # Test with unknown assets
    data = {'currencies': ['DDSAS', 'EUR'], 'async_query': False}
    response = requests.get(
        api_url_for(rotkehlchen_api_server, 'exchangeratesresource'), json=data,
    )
    assert_proper_sync_response_with_result(response)
