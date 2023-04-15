const botResponse = async (message, response) => {
  const sentMessage = await message.reply(response);
  console.log(`Message sent: ${sentMessage}`);
};

module.exports = {
  botResponse,
};