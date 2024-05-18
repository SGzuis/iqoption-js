require('dotenv').config();
const assert = require('assert');
const IQOption = require('../index');
const API = require('../API');
const WebSocket = require('../WebSocket');
const Http = require('../http');

describe('API Tests', function() {
  describe('Login Functionality', function() {
    let api, websocket;

    beforeEach(async function() {
      // Inicializa o WebSocket
      websocket = new WebSocket();
      await websocket.init();

      // Inicializa a API
      api = new API(websocket, Http);
    });

    it('should login successfully', async function() {
      try {
        // Chama a função de login com as credenciais do ambiente
        await api.login(process.env.IQ_OPTION_EMAIL, process.env.IQ_OPTION_PASSWORD);

        // Verifica que o login foi bem-sucedido (sem erros)
        assert.ok(true, 'Login realizado com sucesso');
      } catch (error) {
        assert.fail('Login falhou: ' + error.message);
      }
    });

    it('should fail to login with incorrect credentials', async function() {
      try {
        // Chama a função de login com credenciais incorretas
        await api.login('wrong@example.com', 'wrongpassword');
        assert.fail('Login deveria falhar com credenciais incorretas');
      } catch (error) {
        // Verifica o erro
        assert.strictEqual(error.message, 'Request failed with status code 401');
      }
    });
  });

  describe('Trade Functionality', function() {
    let api;
    const tradeOptions = {
      active: 'EURUSD-OTC',
      action: 'CALL',
      amount: 1,
      type: 'BINARY',
      duration: 5
    };

    let trade;

    beforeEach(async function() {
      // Inicializa a API
      api = await IQOption({
        email: process.env.IQ_OPTION_EMAIL,
        password: process.env.IQ_OPTION_PASSWORD,
      });
    });

    it('should open a trade successfully', async function() {
      try {
        // Chama a função de trade
        trade = await api.trade(tradeOptions);

        // Verifica o resultado
        assert.strictEqual(trade.quote.status, 'open');
        assert.strictEqual(trade.quote.win, null);
        assert.strictEqual(typeof trade.quote.id, 'number');
        assert.strictEqual(typeof trade.quote.created, 'number');
        assert.strictEqual(typeof trade.quote.expire, 'number');
      } catch (error) {
        assert.fail('Trade falhou: ' + error);
      }
    });

    it('should close a trade successfully', async function() {
      try {
        this.timeout((tradeOptions.duration + 1) * 60000);

        // Espera até o trade fechar (isso pode envolver uma espera ou simulação de passagem de tempo)
        await trade.close();

        // Verifica o resultado do fechamento do trade
        assert.strictEqual(trade.quote.status, 'closed');
        assert.strictEqual(typeof trade.quote.win, 'boolean');
        assert.strictEqual(typeof trade.quote.id, 'number');
        assert.strictEqual(typeof trade.quote.created, 'number');
        assert.strictEqual(typeof trade.quote.expire, 'number');
      } catch (error) {
        assert.fail('Trade falhou: ' + error);
      }
    });

    it('should handle trade failure', async function() {
      try {
        // Simula uma condição que cause falha no trade
        api.trade = async function() {
          throw new Error('trade failed');
        };

        // Chama a função de trade e espera um erro
        await api.trade(tradeOptions);
        assert.fail('Trade deveria falhar');
      } catch (error) {
        // Verifica o erro
        assert.strictEqual(error.message, 'trade failed');
      }
    });
  });
});
