import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Article } from './article';
import { environment } from '../environments/environment';

import { Observable, BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

/*
    [].sort(compare(a, b))
    return value
      0 == they are equal
      1 == a comes before b
     -1 == b comes before a
 */
interface ArticleSortFn {
  (a: Article, b: Article): number;
}
interface ArticleSortOrderFn {
  (direction: number): ArticleSortFn;
}
const sortByTime: ArticleSortOrderFn = (direction: number) =>
  (a: Article, b: Article) => {
    return direction * (
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }
;
const sortByVotes: ArticleSortOrderFn = (direction: number) =>
    (a: Article, b: Article) => {
      return direction * (b.votes - a.votes);
    }
  ;
const sortFns = {
  'Time': sortByTime,
  'Votes': sortByVotes
};


@Injectable()
export class ArticleService {
  
  private _articles: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]);
  private _sources: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  
  private _sortByDirectionSubject: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  private _sortByFilterSubject: BehaviorSubject<ArticleSortOrderFn> = new BehaviorSubject<ArticleSortOrderFn>(sortByTime);
  private _filterBySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _refreshSubject: BehaviorSubject<string> = new BehaviorSubject<string>('reddit-r-all');
  
  public sources: Observable<any> = this._sources.asObservable();
  public articles: Observable<Article[]> = this._articles.asObservable();
  public orderedArticles: Observable<Article[]>;
  
  constructor(
      private http: Http
  ) {
    this._refreshSubject
      .subscribe(this.getArticles.bind(this))
    ;
    
    this.orderedArticles = Observable
      .combineLatest(
        this._articles,
        this._sortByFilterSubject,
        this._sortByDirectionSubject,
        this._filterBySubject
      )
      .map(
        ([articles, sorter, direction, filterStr]) => {
          const re = RegExp(filterStr, 'gi');
          return articles
            .filter( a => re.exec(a.title) )
            .sort(sorter(direction))
          ;
        }
      )
    ;
  }
  
  public sortBy(
    filter: string,
    direction: number
  ): void {
    this._sortByDirectionSubject.next(direction);
    this._sortByFilterSubject.next(sortFns[filter]);
  }
  
  public filterBy(filter: string) {
    this._filterBySubject.next(filter);
  }

  public updateArticles(sourceKey): void {
    this._refreshSubject.next(sourceKey);
  }
  
  public getArticles(sourceKey = 'reddit-r-all'):void {
    // make http request -> Observable
    // convert json response into Artikel list
    // update BehaviourSubject
    this._makeHttpRequest('/v1/articles', sourceKey)
      .map( json => json.articles )
      .subscribe( articlesJson => {
        const articles = articlesJson
          .map( articlefromjson => Article.fromJSON(articlefromjson) )
        ;
        this._articles.next(articles);
      })
    ;
  }
  
  public getSources():void {
    this._makeHttpRequest('/v1/sources')
      .map( json => json.sources )
      .filter( list => list.length > 0 )
      .subscribe(this._sources)
    ;
  }
    
  private _makeHttpRequest(
    path: string,
    sourceKey?: string
  ): Observable<any>
  {
    let params = new URLSearchParams();
    params.set('apiKey', environment.apiKey);
    if (sourceKey && sourceKey !== '') {
      params.set('source', sourceKey);
    }
    return this.http
      .get(
        `${environment.baseUrl}${path}`,
        {search: params}
      )
      .map( resp => resp.json() )
    ;
  }
}
