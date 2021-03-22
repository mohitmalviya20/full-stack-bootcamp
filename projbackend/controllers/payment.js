const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId:   '6kwmw3w9bkkgb7nt',
  publicKey:    'zs9jcrr36ckk6w4v',
  privateKey:   '0bfe9cb36e809eb0c233a1213de754db'
});


exports.getToken =(req,res)=>{
    gateway.clientToken.generate({
      }, (err, response) => {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.send(response)
        }
      });
}

exports.processPayment=(req,res)=>{
    let nonceFromTheClient= req.body.paymentMethodNonce
    let amountFromTheClient = req.body.amount
    gateway.transaction.sale({
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true
        }
      }, (err, result) => {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.send(result)
        }
      });

}