interface ArticleJSON {
    author: string,
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    votes: number;
    publishedAt: Date;
}

export class Article {
    public publishedAt: Date;
    constructor(
        public title: string,
        public description: string,
        public urlToImage: string, // imageUrl
        public votes?: number
    ) {
        this.votes = votes || 0;
        this.publishedAt = new Date();
    }

    // Article.fromJSON()
    static fromJSON(json: ArticleJSON): Article {
        let article = Object.create(Article.prototype);
        return Object.assign(article, json, {
            votes: json.votes
                ? json.votes
                : 0
            ,
            publishedAt: json.publishedAt
                ? new Date(json.publishedAt)
                : new Date()
        });
    }

    public voteUp() {
        this.votes++;
    }

    public voteDown() {
        this.votes--;
    }
}
