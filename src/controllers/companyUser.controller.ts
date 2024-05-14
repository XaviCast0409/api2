import db from "../config/dbConnect";
import { Request, Response } from "express";
import { CompanyUserInput } from "../db/models/companyUser";
import stripe from "../stripe/stripeConfig";

export const createCompanyUser = async (req: Request, res: Response): Promise<Response> => {
  const { UserId, CompanyId }: CompanyUserInput = req.body;

  try {
    const createCompanyUser = await db.CompanyUser.create({
      UserId, CompanyId
    });

    // pago de los 5 dolares


    return res.status(201).json({
      message: 'CompanyUser created successfully',
      status: 201,
      CompanyUser: createCompanyUser,

    });
  } catch (error) {
    console.error('Error creating company user:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      status: 500
    });
  }
};

export const createCompanyUserFunction = async (UserId: number, CompanyId: number): Promise<void> => {
  try {
    console.log('Creating company user:', UserId, CompanyId);
    const findCompany = await db.Company.findOne({
      where: { id: CompanyId }
    });

    // Obtener los métodos de pago de tipo tarjeta asociados a la compañía
    const paymentMethods = await stripe.paymentMethods.list({
      customer: findCompany.customerstripeId,
      type: "card",
    });

    if (!paymentMethods.data.length) {
      throw new Error("No card found for the company");
    }

    // Utiliza el primer método de pago de tarjeta encontrado
    const paymentMethodId = paymentMethods.data[0].id;

    // Crea el PaymentIntent con el método de pago de tarjeta
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500,
      currency: "usd",
      customer: findCompany.customerstripeId,
      payment_method: paymentMethodId, // Usa el ID del método de pago de tarjeta
      confirm: true,
      metadata: {
        CompanyId: CompanyId.toString()
      },
      return_url: "http://localhost:5173/matchingform"
    });
    console.log('PaymentIntent created:', paymentIntent);
    const createCompanyUser = await db.CompanyUser.create({
      UserId: UserId,
      CompanyId: CompanyId
    });
    console.log('CompanyUser created successfully', createCompanyUser);
  } catch (error) {
    console.error(error);
    // Manejo de errores
  }
};
