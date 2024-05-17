//import db from "../config/dbConnect";
import axios from "axios";
import { Request, Response } from "express";
import stripe from "../stripe/stripeConfig";



// Funciones relacionadas con Stripe Payments

export const stripeId = async (req: Request, res: Response) => {
  const { paymentMethodId, amount } = req.body;

  console.log("Creating payment intent with:");
  console.log({ paymentMethodId, amount });

  if (!paymentMethodId || !amount) {
    return res
      .status(400)
      .send({ error: "Payment method ID and amount are required in the request body" });
  }
  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
    });

    console.log("Created payment intent:");
    console.log(paymentIntent);

    return res.send({ client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};


export const stripeById = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  console.log("Retrieving Stripe checkout session with id:", sessionId);
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["customer", "setup_intent.payment_method"],
  });
  console.log("Retrieved Stripe checkout session:", checkoutSession);
  res.send({ checkoutSession });
  console.log("Sent retrieved Stripe checkout session to client");
};

const priceId = "price_1P4Ve9P7so0IzTMyTEapwedZ"; //! Replace this with the actual ID of your price on Stripe.

export const createCheckoutSession = async (req: Request, res: Response) => {
  console.log("Creating Stripe checkout session");
  console.log("Using price ID:", priceId);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url:
      "https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://example.com/canceled.html",
  });

  console.log("Created Stripe checkout session:", session);
  res.send({ session });
};

//! This is linked to the phone and email form on the frontend.

export const createCustomer = async (email: string) => {
  try {
    console.log("Creating customer with email:", email);
    const customer = await stripe.customers.create({ email });
    console.log("Customer created:", customer.id);
    console.log("Returning customer:", customer);
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    console.error("Error details:", error);
    throw error;
  }
};




export const associateCardWithPayment = async (req: Request, res: Response) => {
  try {
    const { companyId, email ,paymentMethodId } = req.body;
    console.log("Received request to associate card with payment");
    console.log("companyId id:", companyId);
    console.log("paymentMethodId:", paymentMethodId);

    if (!companyId) {
      throw new Error("companyId is required");
    }

    if (!email) {
      throw new Error("email is required");
    }

    if (!paymentMethodId) {
      throw new Error("paymentMethodId is required");
    }

    // Verificar si el cliente existe en Stripe

    console.log("Verifying if customer exists in Stripe");

    const customers = await stripe.customers.list({ email });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      // If the customer does not exist, create it
      customer = await stripe.customers.create({ email });
    }

    // Asociar la tarjeta de pago con el cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Realizar un cargo de un dólar al cliente usando la tarjeta recién asociada
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "usd",
      customer: customer.id,
      payment_method_types: ["card"],
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });
    console.log("Created payment intent with ID:", paymentIntent.id);
    res.json({ paymentIntent });
  } catch (error: any) {
    console.error("Error associating card with payment:", error);
    res.status(500).send({ error: error.message });
  }
};



export const addCardDetails = async (req: Request, res: Response) => {
  try {
    const { customerId, cardNumber, expMonth, expYear, cvc } = req.body;

    if (!customerId || !cardNumber || !expMonth || !expYear || !cvc) {
      throw new Error("All fields are required");
    }

    const card = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
    });

    // Attach the card to the customer
    await stripe.paymentMethods.attach(card.id, {
      customer: customerId,
    });

    // Set the card as the customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: card.id,
      },
    });

    res.json({ message: "Card successfully added to customer" });
  } catch (error) {
    console.error("Error adding card to customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createSetupIntent = async (req: Request, res: Response) => {
  try {
    console.log("Creating SetupIntent...");
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
    });
    console.log("SetupIntent created successfully:", setupIntent);
    res.json({ client_secret: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating SetupIntent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const secretClient = async (req: Request, res: Response) => {
  try {
    console.log("Calling create-setupIntent endpoint...");
    const response = await axios.post(
      "http://localhost:3000/create-setupIntent"
    );
    console.log("Response from create-setupIntent:", response.data);
    const { client_secret } = response.data;
    console.log("Successfully got client_secret:", client_secret);
    res.send({ client_secret });
  } catch (error) {
    console.error("Error getting client_secret from SetupIntent:", error);
    console.error("Full error:", error);
    res
      .status(500)
      .send({ error: "Error getting client_secret from SetupIntent" });
  }
};


export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    console.log("Creating PaymentIntent...");
    const { customerId, paymentMethodId } = req.body;
    // const pricePerTrade = 1;
    // const numberOfTradesPerWeek = 5;


    console.log("Request body:", req.body);
    // console.log("Total amount per week:", totalAmountPerWeek);
    console.log("customerId:", customerId);
    console.log("paymentMethodId:", paymentMethodId);

    // Create a PaymentIntent with the provided parameters
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "usd",
      payment_method_types: ["card"],
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,

    });

    console.log("Created PaymentIntent:", paymentIntent);

    res.send({ paymentIntent });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    console.error("Full error:", error);
    res.status(500).send({ error: "Error creating PaymentIntent" });
  }
};

export const handlePaymentFailure = async (req: Request, res: Response) => {
  try {
    const { error } = req.body;
    if (error.code === "authentication_required") {
      const { payment_intent } = error;

      // Get the failed PaymentIntent
      const failedPaymentIntent = await stripe.paymentIntents.retrieve(
        payment_intent
      );
      if (failedPaymentIntent.status === "requires_payment_method") {
        // Send the client secret to the frontend to allow the client to authenticate the payment
        res
          .status(402)
          .send({ client_secret: failedPaymentIntent.client_secret });
        return;
      }
    }

    res.status(500).send({ error: "Payment could not be completed" });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};



export const webhook = async (req: Request, res: Response) => {
  try {
    if (
      req.headers["stripe-signature"] === undefined ||
      req.headers["stripe-signature"] === null
    ) {
      throw new Error("No Stripe signature found in request headers");
    }

    const endpointSecret =
      "whsec_1f34030a3235f0ab5bede0bb713a552de306d64572b4e2ac1d5f65f9d68b6354";
    const sig = req.headers["stripe-signature"] as string;
    const body = req.body;

    if (body === undefined || body === null) {
      throw new Error("No request body found");
    }

    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    let paymentIntentFailed;

    let paymentIntent;
    switch (event.type) {
      case "payment_intent.succeeded":
        paymentIntent = event.data.object;
        console.log("PaymentIntent was successful!", paymentIntent);
        break;
      case "payment_intent.payment_failed":
        paymentIntentFailed = event.data.object;
        console.log("PaymentIntent failed!", paymentIntentFailed);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`Error ${err.message}`, err);
    if (err.stack !== undefined) {
      console.error(err.stack);
    }
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const createCardToken = async ({ body: { customerId, token } }: Request, res: Response) => {
  if (!customerId || !token) {
    console.log("createCardToken: Customer ID and card token are required in the request body");
    return res.status(400).json({ error: "Customer ID and card token are required in the request body" });
  }
  try {
    console.log("createCardToken: About to call stripe.customers.createSource");
    const { id } = await stripe.customers.createSource(customerId, { source: token });
    console.log("createCardToken: Successfully called stripe.customers.createSource, id:", id);
    res.json({ id });
  } catch (error) {
    console.error("Error creating card token:", error);
    console.error("createCardToken: Error creating card token");
    res.status(500).json({ error: "Error creating card token" });
  }
};


export const getAllCustomers = async (_req: Request, res: Response) => {
  try {
    console.log("getAllCustomers: About to call stripe.customers.list");
    const customers = await stripe.customers.list({ limit: 100 });
    console.log("getAllCustomers: Successfully called stripe.customers.list");
    res.send({
      data: customers.data,
      has_more: customers.has_more,
      url: customers.url,
    });
  } catch (error) {
    console.error("Error getAllCustomers:", error);
    console.error("getAllCustomers: Error getting customers from Stripe");
    res.status(500).send({ error: "Error getting customers from Stripe" });
  }
};



export const getPaymentMethodId = (_req: Request, res: Response) => {
  res.send({ id: "pm_card_visa" });
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  let paymentMethodId: string;
  try {
    paymentMethodId = req.body.paymentMethodId;
    if (!paymentMethodId) {
      throw new Error("Payment method ID is required in the request body");
    }
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(400).json({ error: "Payment method ID is required in the request body" });
    return;
  }

  try {
    const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    res.json({ message: "Payment method successfully detached", detachedPaymentMethod });
  } catch (error: any) {
    console.error("Error detaching payment method:", error);
    if (error.type === "StripeInvalidRequestError" && error.code === "resource_missing") {
      res.status(404).json({ error: "Payment method not found" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};



export const getCustomerCardId = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    console.log("Fetching card for customer:", customerId);

    // Obtener el PaymentMethod asociado al cliente
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    // Verificar si hay PaymentMethods asociados al cliente
    if (paymentMethods.data.length > 0) {
      // Tomar el primer PaymentMethod, asumiendo que es la tarjeta principal
      const cardDetails = {
        last4: paymentMethods.data[0].card?.last4, // Últimos 4 dígitos de la tarjeta
        brand: paymentMethods.data[0].card?.brand, // Marca de la tarjeta (Visa, Mastercard, etc.)
      };

      console.log("Card details:", cardDetails);
      res.send(cardDetails);
    } else {
      console.log("No card found for customer:", customerId);
      res.status(404).send({ error: "No card found for customer" });
    }
  } catch (error) {
    console.error("Error fetching customer card:", error);
    res.status(500).send({ error: "Error fetching customer card" });
  }
};