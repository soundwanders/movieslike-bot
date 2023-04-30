const mockBotResponse = jest.fn(async (message, response) => {
  console.log(`Message sent: ${response}`);
});

module.exports = {
  mockBotResponse,
};
