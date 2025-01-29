import { Gitlab } from "@gitbeaker/node";
import { PLATFORM } from "../.config.js";
import { colors } from "../colors.js";
import { assertUnreachable } from "../utils/assertUnreachable.js";
import { incVersionTag } from "../utils/incVersionTag.js";

const ENVS = ["test", "rc", "prod"];
const TARGET_BRANCH = "rc";

class Tags {
  constructor() {
    this.api = new Gitlab({
      host: PLATFORM.host,
      token: PLATFORM.token,
    });
  }

  async applyNewTags(env, projectId, message = "") {
    if (!env || !ENVS.includes(env)) {
      assertUnreachable('missing env param! Please choose "rc" or "prod"');
    }

    if (projectId) {
      const project = PLATFORM.projects?.find(
        (project) => project.id === projectId
      );

      if (!project) {
        assertUnreachable(
          `not found project with id «${projectId}» in config file`
        );
      }

      await this.applyNewTagToProject(project, env, message);
    } else {
      for (const project of PLATFORM.projects) {
        await this.applyNewTagToProject(project, env, message);
      }
    }
  }

  async applyNewTagToProject(project, env, message) {
    if (!project?.options?.autotag) {
      console.log(colors.yellow, `\nProject «${project.title}» skipped`);
      return;
    }

    console.log(colors.white, `\nProject «${project.title}»:`);

    const [currentTag] = await this.api.Tags.all(project.id, {
      page: 1,
      perPage: 1,
      order_by: "version",
      sort: "desc",
    });

    const newTag = await this.getNewTag(project, currentTag?.name, env);

    // message - пояснение к созданию тега
    await this.api.Tags.create(project.id, newTag, TARGET_BRANCH, {
      message,
    });

    console.log(
      colors.green,
      `create new tag «${newTag}» from branch ${TARGET_BRANCH} ...ok`
    );
  }

  async getNewTag(project, tag, env) {
    const prodTag = tag.replace(/-RC\d$/, "");
    if (await this.checkExistTag(project.id, prodTag)) {
      /**
       * Если последний тег без суффикса RC существует, значит уже есть такой продовский тег,
       * необходимо его поднять
       */
      return incVersionTag(prodTag, env);
    }

    if (env === "prod") {
      /**
       * Возвращаем продовский тег. Он уже был проверен выше, значит свободен.
       */
      return prodTag;
    }

    /**
     * Иначе инкрементим версию тега
     */
    return incVersionTag(tag, env);
  }

  async checkExistTag(projectId, tag) {
    return this.api.Tags.show(projectId, tag)
      .then(() => true)
      .catch(() => false);
  }
}

export default async function addNewTags(env, projectId, message) {
  const tags = new Tags();
  await tags.applyNewTags(env, projectId, message);
}
