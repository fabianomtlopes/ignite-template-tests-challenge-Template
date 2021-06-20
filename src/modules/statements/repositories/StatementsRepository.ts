import { DH_CHECK_P_NOT_SAFE_PRIME } from "node:constants";
import { getRepository, Repository } from "typeorm";

import { OperationType, Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { ICreateTransferenceDTO } from "../useCases/createTransference/ICreateTransferenceDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type
    });

    return this.repository.save(statement);
  }



  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statement = await this.repository.find({
      where: { user_id }
    });

    const balance = statement.reduce((acc, operation) => {
    const operationAmount = parseFloat(String(operation.amount));

      if (operation.type === 'deposit' && operation.user_id) {
        return acc + operationAmount;//operation.amount;
      } else if (operation.type === 'transfer' && operation.sender_id  ){
        return acc + operationAmount;
      }
      else {
        return acc - operationAmount;//operation.amount;
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }

  async transferOperation({sender_id, recipient_id, amount, description} : ICreateTransferenceDTO): Promise<Statement[]> {

    const sendTransferOperation = this.repository.create({
          user_id: sender_id,
          recipient_id,
          amount,
          description,
          type: OperationType.TRANSFER
        });

        const recipientTransferOperation = this.repository.create({
          user_id: recipient_id,
          sender_id,
          amount,
          description,
          type: OperationType.TRANSFER
        });

    await this.repository.save(sendTransferOperation)
    await this.repository.save(recipientTransferOperation);

    return [sendTransferOperation,recipientTransferOperation];
  }
}
