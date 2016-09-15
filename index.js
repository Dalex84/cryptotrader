// import deps

// underscore api
var _ = require('./node_modules/underscore');
// moment api
var moment = require('./node_modules/moment');
// fs api
var fs = require('fs');

// exchanges
// poloniex node api lib and api config file
var poloniex = require('./node_modules/plnx');
var poloniexAPI = require('./config/poloniex.json');
// kraken node api lib and api config file
var KrakenClient = require('./node_modules/kraken-exchange-api/kraken.js');
var krakenAPI = require('./config/kraken.json');
var kraken = new KrakenClient(krakenAPI.key, krakenAPI.privateKey);
// bittrex node api lib and api config file
var bittrex = require('./node_modules/node.bittrex.api/node.bittrex.api.js');
var bittrexAPI = require('./config/bittrex.json');
// bter node api lib and api config file
// todo
//var bter = require('./node_modules/node-bter/bter.js');

// currencies for arbitrage
var currencies = ["ETC", "ETH", "XRP"];
// enabled exchanges, remove unused exchanges if necessary
var exchanges = ["poloniex", "bittrex", "kraken"];

// configuration
var configPath = "./config/"
var apiObj = {};
var timerValue = 5;
var debug = true;

var getLastPrice = function (exchange, currency) {
    if (debug) {
        console.reset();
    }
    var poloniexPrice;
    var krakenPrice;
    var bittrexPrice;

    if (exchange === "poloniex") {
        getPoloniexPrice(currency, function (result) {
            poloniexPrice = result;
            if (debug) {
                console.log(currency + ": poloniex " + poloniexPrice);
            }
        });

    }

    if (exchange === "kraken") {
        getKrakenPrice(currency, function (result) {
            krakenPrice = result;
            if (debug) {
                    console.log(currency + ": kraken " + krakenPrice);
                }
        });
    }
    if (exchange === "bittrex") {
        getBittrexPrice(currency, function (result) {
            bittrexPrice = result;
            if (debug) {
                console.log(currency + ": bittrex " + bittrexPrice);
            }
        })
    }
}

setInterval(function () {
    _.each(exchanges, function (exchange) {
        _.each(currencies, function (currency) {
            currency.lastPrice = getLastPrice(exchange, currency);
        });
    });
}, timerValue * 1000);

// reset terminal output
console.reset = function () {
    return process.stdout.write('\033c');
}

// get poloniex price for coin
var getPoloniexPrice = function (currency, callback) {
    poloniex.returnTicker({}, function (error, data) {
        if (error) {
            console.log(error);
        }
        else {
            _.each(data, function (ticker, name) {
                if (name === "BTC_" + currency) {
                    callback(parseFloat(ticker.last).toFixed(8));
                }
            });
        }
    });
}

// get kraken price for coin
var getKrakenPrice = function (currency, callback) {
    kraken.api('Ticker', { "pair": 'X' + currency + 'XXBT' }, function (error, data) {
        if (error) {
            console.log(error);
        }
        else {
            _.each(data.result, function (result) {
                callback(parseFloat(result.a[0]).toFixed(8));
            })
        }
    });
}

// get bittrex price for coin
var getBittrexPrice = function (currency, callback) {
    bittrex.getmarketsummaries(function (data) {
        _.each(data.result, function (ticker) {
            if (ticker.MarketName == "BTC-" + currency) {
                callback(parseFloat(ticker.Last).toFixed(8));
            }

        })
    });
}