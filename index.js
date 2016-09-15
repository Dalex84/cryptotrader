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

// currencies for arbitrage
var currencies = ["ETC", "ETH"];
// enabled exchanges, remove unused exchanges if necessary
var exchanges = ["poloniex", "bittrex", "kraken"];

// configuration
var configPath = "./config/"
var apiObj = {};
var timerValue = 5;

var getLastPrice = function (exchange, currency) {
    console.reset();
    if (exchange === "poloniex") {
        // get price from poloniex
        poloniex.returnTicker({}, function (error, data) {
            if (error) {
                console.log(error);
            }
            else {
                _.each(data, function(ticker,name){
                    if(name === "BTC_" + currency){
                        console.log(currency + ": poloniex " + parseFloat(ticker.last).toFixed(8));
                    }
                });
            }
        });
    }
    if (exchange === "kraken") {
        // get price from poloniex
        kraken.api('Ticker', {"pair": 'X' + currency + 'XXBT'}, function (error, data) {
            if (error) {
                console.log(error);
            }
            else {
                _.each(data.result, function(result){
                    console.log(currency + ": kraken " + parseFloat(result.o).toFixed(8));
                })
            }
        });
    }
    if (exchange === "bittrex") {
        // get price from bittrex
        bittrex.getmarketsummaries( function( data ) {
            _.each(data.result, function(ticker){
                if(ticker.MarketName == "BTC-"+currency){
                    console.log(currency + ": bittrex " + parseFloat(ticker.Last).toFixed(8));
                }
                
            })
        });
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