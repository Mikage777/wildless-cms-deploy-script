import {assertUnreachable} from "../utils/assertUnreachable.js";
import {PLATFORM} from "../.config.js";
import {colors} from "../colors.js";
import {Gitlab} from "@gitbeaker/node";

const HOLD = ["true", "false"];
const TARGET_BRANCH = "rc"
const FILE_PATH = ".wlc.json"

class Hold {
    constructor() {
        this.api = new Gitlab({
            host: PLATFORM.host,
            token: PLATFORM.token,
        });
    }

    async getWlc(projectId){
        const file = await this.api.RepositoryFiles.show(projectId, FILE_PATH, TARGET_BRANCH);
        const content = Buffer.from(file.content, 'base64').toString('utf-8');
        return JSON.parse(content);
    }

    async applyUpdatesToWlc(projectId, message, body) {
        await this.api.Commits.create(projectId, TARGET_BRANCH, message, [
            {
                action: 'update',
                filePath: FILE_PATH,
                content: JSON.stringify(body, null, 2)
            }
        ])
    }

    async updateWlc(projectId, isHold, message = "") {
        if (!isHold || !HOLD.includes(isHold)) {
            assertUnreachable(
                `missing hold param! Please choose "true" or "false"`
            );
        }

        const project = PLATFORM.projects?.find(
            (project) => project.id === projectId
        );

        if (!project) {
            assertUnreachable(
                `not found project with id «${projectId}» in config file`
            );
        }

        const isSettingToHold = isHold === "true"

        const commitMessage = isSettingToHold ? '[force] set on hold' : '[force] remove from hold'
        const logMessage = isSettingToHold ? 'поставлен на холд' : 'снят с холда'

        try {
            const config = await this.getWlc(project.id)

            const newConfig = {
                ...config,
                "IS_HOLD": isHold,
                "INFORM_TEXT": message
            }

            await this.applyUpdatesToWlc(project.id, commitMessage, newConfig)

            const colorFunc = isSettingToHold ? colors.yellow : colors.green;

            console.log(
                colors.white,
                `✅️ Портал «${project.title}»:`,
                colorFunc,
                logMessage
            );

        } catch (error) {
            assertUnreachable(
                `❌ Ошибка: - «${project.title}» - ${error}`
            );
            process.exit(1);
        }
    }

}

export default async function toggleHold(projectId, isHold, message) {
    const hold = new Hold()
    await hold.updateWlc(projectId, isHold, message);
}
