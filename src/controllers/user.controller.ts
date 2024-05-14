import db from "../config/dbConnect";
import { Request, Response } from "express";
import { UserInput } from "../db/models/user";
import { createCompanyUserFunction } from "./companyUser.controller";

export const getAllUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { page, size } = req.query;
  const pageNumber: number = parseInt(page as string, 10);
  const pageSize: number = parseInt(size as string, 10);
  const offset: number = (pageNumber - 1) * pageSize;
  try {
    const { count, rows } = await db.User.findAndCountAll({
      offset,
      limit: pageSize,
      include: db.ZipCode,
    });

    const totalPages = Math.ceil(count / pageSize);

    return res.status(200).json({
      message: "ok",
      status: 200,
      totalPages,
      currentPage: pageNumber,
      totalUsers: count,
      user: rows,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    name,
    last_name,
    email,
    phone,
    address,
    zipCodeId,
    CompanyId,
  }: UserInput = req.body;

  try {
    const findUser = await db.User.findOne({
      where: { email },
    });

    if (findUser) {
      return res.status(400).send({
        message: "User already exists",
        status: 200,
      });
    }

    const newUser = await db.User.create({
      name,
      last_name,
      email,
      phone,
      address,
      ZipCodeId: zipCodeId,
    });
    console.log(CompanyId)

    if (CompanyId) {
      for (let i = 0; i < CompanyId.length; i++) {
        // Asegúrate de que createCompanyUserFunction sea una función asincrónica
        await createCompanyUserFunction(newUser.id, CompanyId[i]);
      }
    }

    return res.status(200).send({
      status: 200,
      message: "User was created correctly",
      user: newUser,
    });
  } catch (error) {
    // Aquí podrías añadir más detalles sobre el error para facilitar el diagnóstico
    console.error("Error creating user:", error);
    return res.status(400).send(error);
  }
};


export const userById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  try {
    const findUserId = await db.User.findOne({
      where: { id },
    });
    return res.status(200).json({
      message: "ok",
      status: 200,
      user: findUserId,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const filterCompaniesForUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { zipcode, tradeId, classId } = req.query;
    let whereClause: any = {};

    if (zipcode) {
      whereClause.zipcode = zipcode;
    }

    const findZipCode = await db.ZipCode.findOne({
      where: { code: zipcode },
    });
    console.log(findZipCode.state)

    let includeClauses: any[] = [];

    if (Number(tradeId) !== 0 && Number(tradeId) > 0) {
      includeClauses.push({
        model: db.TradeCompanyUser,
        where: {
          id: tradeId,
        },
      });
    } else {
      includeClauses.push({
        model: db.TradeCompanyUser,
      });
    }

    if (Number(classId) && Number(classId) > 0) {
      const classIdFilter = {
        model: db.Class,
        where: {
          id: classId,
        },
      };
      includeClauses[0] = {
        ...includeClauses[0],
        include: classIdFilter,
      };
    } else {
      const classIdFilter = {
        model: db.Class,
      };
      includeClauses[0] = {
        ...includeClauses[0],
        include: classIdFilter,
      };
    }

    const companies = await db.Company.findAll({
      where: { stateCity: findZipCode.state },
      include: includeClauses,
    });

    
    const trades: { id: number; name: string }[] = [];
    const classes: { id: number; name: string }[] = [];
    
    companies?.forEach((company: any) => {
      company?.TradeCompanyUsers?.forEach((trade: any) => {
        const { id, name, Classes } = trade;

        const existingTrade = trades?.find((t) => t.id === id);

        if (!existingTrade) {
          trades.push({ id, name });
        }

        Classes?.forEach((cls: any) => {
          const { id: classId, name: className } = cls;
          const existingClass = classes?.find((c) => c.id === classId);

          if (!existingClass) {
            classes.push({ id: classId, name: className });
          }
        });
      });
    });
    console.log(trades)

    const companiesId = companies.map((company: any) => company.id);
    companiesId.sort(() => Math.random() - 0.5);

    const randomCompanyIds = companiesId.slice(0, 3);

    return res.status(200).json({
      message: "ok",
      trades,
      classes,
      randomCompanyIds,
      companies
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener las compañías." });
  }
};
