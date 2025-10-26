import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConversationStateEntity1751286148503
  implements MigrationInterface
{
  name = 'CreateConversationStateEntity1751286148503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversation_states" ("userId" character varying NOT NULL, "currentState" character varying NOT NULL, "context" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef6a790fd06514f58507c628be1" PRIMARY KEY ("userId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "conversation_states"`);
  }
}
