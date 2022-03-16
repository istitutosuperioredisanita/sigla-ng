
export class Token {

  constructor(public access_token: string,
              public token_type: string,
              public refresh_token: string,
              public exp: number,
              public scope: string,
              public jti: string,
              public valid_until: number,
) {}
}
