import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { Article } from '../article';
import { ArticleService } from '../article.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {
  // @Input() articles: Article[];
  
  private articles: Observable<Article[]>;

  constructor(
    private articleService: ArticleService,
    private activRoute: ActivatedRoute
  ) {
    this.articles = articleService.orderedArticles;
  }

  ngOnInit() {
    this.activRoute.params.subscribe( params => {
        const sourceKey = params['sourceKey'];
        this.articleService.updateArticles(sourceKey);
    });
    //this.articleService.getArticles();
  }

}
