const express = require('express');
require('dotenv').config();
require('./models/db');
const userRouter = require('./routes/user');
var path = require("path");
const expressLayouts = require('express-ejs-layouts');
const User = require('./models/user');
const {userSignIn} = require('./controllers/user');

const app = express();

// app.use(express.json());
// app.use(userRouter);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});


//STRIPE
var stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = process.env.ENDPOINT_SECRETE;

// Match the raw body to content type application/json
app.post('/pay-success', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the purchase...
    //console.log(session);

    User.findOne({email: session.customer_details.email}, async function(err, user){
      if(user){

        //Cancel old subscription if one already exists for this user.
        if (user.subscriptionActive)
        {
          stripe.subscriptions.del(user.subscriptionID);
        }

        await User.findByIdAndUpdate(user._id, { 
          subscriptionActive: true,
          customerID:session.customer,
          subscriptionID:session.subscription
        });

      }
    });
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});

app.use(express.urlencoded()); // for application/x-www-form-urlencoded

app.post('/pay-cancel', (req, res) => {

  var message = "Subscription canceled for " + req.body.email;

  console.log(req.body);

  User.findOne({email: req.body.email}, async function(err, user){

    if(user){

      const isMatch = await user.comparePassword(req.body.password);

      if (!isMatch)
      {
        message = "Incorrect email or password.";
      }
      else
      {
        if (user.subscriptionActive)
        {
          stripe.subscriptions.del(user.subscriptionID);
  
          await User.findByIdAndUpdate(user._id, { 
            subscriptionActive: false,
            customerID: '',
            subscriptionID: ''
          });
        }
      }

    }
    else
    {
      message = "Subscription not found for " + req.body.email;
    }
  });

  stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    subscription_data: {
      items: [{
        plan: process.env.STRIPE_PLAN,
      }],
    },
    success_url: 'https://acquiredynamics.com/payment?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://acquiredynamics.com/payment',
  }, function(err,session){
        var Id = session.id;

        res.render('payment', {
          session: Id,
          STRIPE_PUBLIC_KEY : process.env.STRIPE_PUBLIC_KEY,
          message:message
        })
  });
});

// EJS
//  app.use(expressLayouts);
//  app.set('view engine', 'ejs');

 //app.use(express.json());

  app.use(express.json());
  app.use(userRouter);

  app.use(expressLayouts);
  app.set('view engine', 'ejs');

app.listen(process.env.PORT || 8000, () => {
  console.log('Port is listening');
});
