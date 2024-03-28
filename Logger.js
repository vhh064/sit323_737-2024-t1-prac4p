const express = require('express');
const winston = require('winston');
const app = express();
const port = 3040;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'arithmetic-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Arithmetic operation function
const performOperation = (operation, num1, num2) => {
  switch(operation) {
    case 'add':
      return num1 + num2;
    case 'subtract':
      return num1 - num2;
    case 'multiply':
      return num1 * num2;
    case 'divide':
      if(num2 === 0) throw new Error('Division by zero is not allowed.');
      return num1 / num2;
    default:
      throw new Error('Invalid operation');
  }
};

// Route handler
app.get('/:operation', (req, res) => {
  try {
    const { operation } = req.params;
    const num1 = parseFloat(req.query.n1);
    const num2 = parseFloat(req.query.n2);

    if(isNaN(num1) || isNaN(num2)) {
      throw new Error('Please provide valid numbers for n1 and n2.');
    }

    const result = performOperation(operation, num1, num2);
    res.status(200).json({ statusCode: 200, result: result });
    logger.info(`Operation performed: ${operation} with n1: ${num1}, n2: ${num2}, result: ${result}`);
  } catch (error) {
    logger.error(`Error performing operation: ${req.params.operation}. Error: ${error.message}`);
    const statusCode = error.message === 'Division by zero is not allowed.' || error.message === 'Please provide valid numbers for n1 and n2.' ? 400 : 500;
    res.status(statusCode).json({ statusCode: statusCode, message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  logger.info(`Arithmetic service listening at http://localhost:${port}`);
});
