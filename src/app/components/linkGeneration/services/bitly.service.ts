import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BitlyService {
  private bitlyApiUrl = 'https://api-ssl.bitly.com/v4/shorten';
  private bitlyAccessToken = '4780936227ab759d493bfd1b5b607f93ba9b2950';
  constructor(private http: HttpClient) {}
  shortenLink(longUrl: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.bitlyAccessToken}`);
    const body = {
      long_url: longUrl,
    };
    return this.http.post(this.bitlyApiUrl, body, { headers });
  }
}
