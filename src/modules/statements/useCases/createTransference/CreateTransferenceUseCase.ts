import {inject, injectable} from 'tsyringe';

import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { Statement } from '../../entities/Statement';
import {IUsersRepository} from '../../../users/repositories/IUsersRepository';
import {CreateTransferenceError} from './CreateTransferenceError';
import {ICreateTransferenceDTO} from '../../useCases/createTransference/ICreateTransferenceDTO';


@injectable()
class CreateTransferenceUseCase {

  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
  ){}

  async execute ({ sender_id, recipient_id,  amount, description}: ICreateTransferenceDTO): Promise<Statement[]>  {

    const user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new CreateTransferenceError.UserNotFound();
    }

    const recipientUser = await this.usersRepository.findById(recipient_id);

    if(!recipientUser){
      throw new CreateTransferenceError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if ( amount > balance) {
      throw new CreateTransferenceError.InsufficientFunds()
    }

    const transfer = await this.statementsRepository.transferOperation({
      sender_id,
      recipient_id,
      amount,
      description
    });

    return transfer;

  }

}

export {CreateTransferenceUseCase};
