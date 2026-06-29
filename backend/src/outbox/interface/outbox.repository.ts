export abstract class OutboxRepository {
	abstract save(input: { identifier: string; payload: any }): Promise<void>
}
