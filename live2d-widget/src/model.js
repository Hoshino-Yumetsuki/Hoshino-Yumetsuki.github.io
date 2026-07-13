import showMessage from "./message.js";
import randomSelection from "./utils.js";

class Model {
    constructor(config) {
        let { apiPath, cdnPath } = config;
        let useCDN = false;
        if (typeof cdnPath === "string") {
            useCDN = true;
            if (!cdnPath.endsWith("/")) cdnPath += "/";
        } else if (typeof apiPath === "string") {
            if (!apiPath.endsWith("/")) apiPath += "/";
        } else {
            throw "Invalid initWidget argument!";
        }
        this.useCDN = useCDN;
        this.apiPath = apiPath;
        this.cdnPath = cdnPath;
    }

    async loadModelList() {
        const response = await fetch(`${this.cdnPath}model_list.json`);
        this.modelList = await response.json();
    }

    async checkUrl(url) {
        try {
            const response = await fetch(url);
            return response.ok;
        } catch {
            return false;
        }
    }

    async tryLoadCDN(modelId, excludeTarget) {
        const modelGroup = this.modelList.models[modelId];
        if (!modelGroup) return false;
        for (const target of modelGroup) {
            if (target === excludeTarget) continue;
            const url = `${this.cdnPath}model/${target}/index.json`;
            if (await this.checkUrl(url)) {
                loadlive2d("live2d", url);
                return true;
            }
            console.warn(`Live2D 资源不可用: ${url}`);
        }
        return false;
    }

    async loadNextValidModel(failedModelId) {
        const total = this.modelList.models.length;
        for (let i = 1; i < total; i++) {
            const nextId = (Number(failedModelId) + i) % total;
            if (await this.tryLoadCDN(nextId)) {
                localStorage.setItem("modelId", nextId);
                localStorage.setItem("modelTexturesId", 0);
                showMessage(this.modelList.messages[nextId] || "换了一个新模型哦！", 4000, 10);
                return true;
            }
        }
        console.error("Live2D: 所有模型均不可用");
        showMessage("所有模型都加载失败了…", 4000, 10);
        return false;
    }

    async loadModel(modelId, modelTexturesId, message) {
        localStorage.setItem("modelId", modelId);
        localStorage.setItem("modelTexturesId", modelTexturesId);
        showMessage(message, 4000, 10);
        if (this.useCDN) {
            if (!this.modelList) await this.loadModelList();
            const modelGroup = this.modelList.models[modelId];
            if (!modelGroup || modelGroup.length === 0) {
                await this.loadNextValidModel(modelId);
                return;
            }
            const target = randomSelection(modelGroup);
            const url = `${this.cdnPath}model/${target}/index.json`;
            if (await this.checkUrl(url)) {
                loadlive2d("live2d", url);
                return;
            }
            console.warn(`Live2D 资源不可用: ${url}，尝试其他服装`);
            if (await this.tryLoadCDN(modelId, target)) {
                showMessage("这件衣服找不到了，换了一件新的~", 4000, 10);
                return;
            }
            showMessage("这个模型的衣服都找不到了，换个模型吧", 4000, 10);
            await this.loadNextValidModel(modelId);
        } else {
            loadlive2d("live2d", `${this.apiPath}get/?id=${modelId}-${modelTexturesId}`);
            console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
        }
    }

    async loadRandModel() {
        const modelId = localStorage.getItem("modelId"),
            modelTexturesId = localStorage.getItem("modelTexturesId");
        if (this.useCDN) {
            if (!this.modelList) await this.loadModelList();
            const modelGroup = this.modelList.models[modelId];
            if (!modelGroup || modelGroup.length <= 1) {
                showMessage("我还没有其他衣服呢！", 4000, 10);
                return;
            }
            const shuffled = [...modelGroup].sort(() => Math.random() - 0.5);
            for (const target of shuffled) {
                const url = `${this.cdnPath}model/${target}/index.json`;
                if (await this.checkUrl(url)) {
                    loadlive2d("live2d", url);
                    showMessage("我的新衣服好看嘛？", 4000, 10);
                    return;
                }
                console.warn(`Live2D 资源不可用: ${url}`);
            }
            showMessage("衣服都找不到了，换个模型看看吧", 4000, 10);
            await this.loadNextValidModel(modelId);
        } else {
            fetch(`${this.apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
                .then(response => response.json())
                .then(result => {
                    if (result.textures.id === 1 && (modelTexturesId === 1 || modelTexturesId === 0)) showMessage("我还没有其他衣服呢！", 4000, 10);
                    else this.loadModel(modelId, result.textures.id, "我的新衣服好看嘛？");
                });
        }
    }

    async loadOtherModel() {
        let modelId = localStorage.getItem("modelId");
        if (this.useCDN) {
            if (!this.modelList) await this.loadModelList();
            const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
            this.loadModel(index, 0, this.modelList.messages[index]);
        } else {
            fetch(`${this.apiPath}switch/?id=${modelId}`)
                .then(response => response.json())
                .then(result => {
                    this.loadModel(result.model.id, 0, result.model.message);
                });
        }
    }
}

export default Model;
