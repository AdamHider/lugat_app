export class ApiService {
  baseUrl = "/";

  constructor(config){
    Object.assign(this, config);
  }
  setResource = (context, method) =>  {
    context = context.charAt(0).toUpperCase() + context.slice(1);
    return this.baseUrl+`${context}/${method}`;
  }
  setHeaders = (context, method) =>  {
    let headers = {
        "Content-Type": "application/json"
    };
    if(method == 'uploadItem') headers = {}
    if(localStorage['x-sid']) headers['x-sid'] = localStorage['x-sid'];
    return headers;
  }

  post = async(context, method, params = {}) =>  {
    var self = this;
    let responseData = {};
    const resource = this.setResource(context, method);
    const headers = this.setHeaders(context, method);
    let data = JSON.stringify(params);
    if(method == 'uploadItem') data = params
    await fetch(resource, {
        method: 'POST', // or 'PUT'
        credentials: 'include',
        headers: headers,
        body: data,
        })
        .then((response) => {
            if(response.headers.get('x-sid')){
                localStorage.setItem('x-sid', response.headers.get('x-sid'))
            }
            return response.json()
        })
        .then((data) => {
            responseData = data;
        })
        .catch((error) => {
            responseData = error;
        });
    return responseData;
  }
}


export class Api extends ApiService{
    translator = {
        analyze: (params) => {
            return this.post('translator', 'analyze', params)
        },
        train: (params) => {
            return this.post('translator', 'train', params)
        },
        predict: (params) => {
            return this.post('translator', 'predict', params)
        },
        getTranslations: (params) => {
            return this.post('translator', 'getTranslations', params)
        },
    }
    sentence = {
        getPair: (params) => {
            return this.post('sentence', 'getPair', params)
        },
        getPairList: (params) => {
            return this.post('sentence', 'getPairList', params)
        },
        setTrained: (params) => {
            return this.post('sentence', 'setTrained', params)
        },
        feed: (params) => {
            return this.post('sentence', 'feed', params)
        },
    }
    token = {
        getList: (params) => {
            return this.post('token', 'getList', params)
        },
        predictList: (params) => {
            return this.post('token', 'predictList', params)
        }
    }
    tokenRelation = {
        getList: (params) => {
            return this.post('tokenRelation', 'getList', params)
        },
        saveList: (params) => {
          return this.post('tokenRelation', 'saveList', params)
        }
    }
    word = {
      getTranslations: (params) => {
          return this.post('word', 'getTranslations', params)
      },
    }

}
