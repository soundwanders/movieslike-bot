const defaultResponse = async (message, response) => {
  if (typeof message.reply === 'function') {
    const sentMessage = await message.reply(response);
    console.log(`Message sent: ${sentMessage}`);
    return sentMessage;
  } else {
    console.log(`Unable to send message: ${response}`);
  }
};

module.exports = {
  defaultResponse,
};
