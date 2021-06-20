import {Request, Response} from 'express';
import { container } from "tsyringe";
import {CreateTransferenceUseCase} from './CreateTransferenceUseCase'


class CreateTransferenceController {

  async handle (request: Request, response: Response): Promise<Response>{

    const {id : sender_id} = request.user;
    const { recipient_id } = request.params;
    const {  amount, description,} = request.body;

    const createTransferenceUseCase = container.resolve(CreateTransferenceUseCase);

    const transfer = await createTransferenceUseCase.execute({
      sender_id,
      recipient_id,
      amount,
      description,
      });

      return response.status(201).json(transfer)
  }
}

export {CreateTransferenceController}
