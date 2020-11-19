module.exports = {
    hello: () => {
        return Math.random().toString(36).substring(7);
    },

    setMessage: ({message}) => {
        return message;
    },
};