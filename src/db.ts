import { PrismaClient } from "@prisma/client";
import Decimal from "decimal.js";
import fs from "fs";

const prisma = new PrismaClient();

export default prisma;

export async function addUser(userId: number): Promise<any> {
  const isExisted = await checkUser(userId);

  if (!isExisted) {
    await prisma.user.create({
      data: { telegramId: userId },
    });
  }
}

export async function checkUser(userId: number): Promise<boolean> {
  const existedUser = await prisma.user.findUnique({
    where: { telegramId: userId },
  });
  return existedUser != null;
}

export async function addBalance(userId: number, value: Decimal): Promise<any> {
  await prisma.user.update({
    where: { telegramId: userId },
    data: { balance: { increment: value } },
  });
}

export async function getBalance(userId: number): Promise<Decimal | undefined> {
  const existedUser = await prisma.user.findUnique({
    where: { telegramId: userId },
  });
  return existedUser?.balance;
}

export async function readLastLt(): Promise<number> {
  try {
    const data = fs.readFileSync("last_lt.txt", "utf-8");
    return parseInt(data, 10);
  } catch (error) {
    return 0;
  }
}

export async function writeLastLt(lt: number): Promise<void> {
  fs.writeFileSync("last_lt.txt", lt.toString(), "utf-8");
}
