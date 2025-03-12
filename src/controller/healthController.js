const ping = async (req, res, next) => {
    try {
        res.status(200).send('pong');        
    } catch (error) {
        next(error);
    }
}

export default  {
    ping
}