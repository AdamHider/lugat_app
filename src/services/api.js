export class ApiService {
  baseUrl = "/";

  constructor(config) {
    Object.assign(this, config);
  }
  setResource = (context, method) => {
    context = context.charAt(0).toUpperCase() + context.slice(1);
    return this.baseUrl + `${context}/${method}`;
  }
  setHeaders = (context, method) => {
    let headers = {
      "Content-Type": "application/json"
    };
    if (method == 'uploadItem') headers = {}
    if (localStorage['x-sid']) headers['x-sid'] = localStorage['x-sid'];
    return headers;
  }

  post = async (context, method, params = {}) => {
    var self = this;
    let responseData = {};
    const resource = this.setResource(context, method);
    const headers = this.setHeaders(context, method);
    let data = JSON.stringify(params);
    if (method == 'uploadItem') data = params
    await fetch(resource, {
      method: 'POST', // or 'PUT'
      credentials: 'include',
      headers: headers,
      body: data,
    })
      .then((response) => {
        if (response.headers.get('x-sid')) {
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


export class Api extends ApiService {
  sentence = {
    getPair: (params) => {
      return this.post('sentence', 'getPair', params)
    },
    getPairList: (params) => {
      return this.post('sentence', 'getPairList', params)
    },
    getList: (params) => {
      return this.post('sentence', 'getList', params)
    },
    setTrained: (params) => {
      return this.post('sentence', 'setTrained', params)
    },
    setSkipped: (params) => {
      return this.post('sentence', 'setSkipped', params)
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
    getItem: (params) => {
      return this.post('word', 'getItem', params)
    },
    getList: (params) => {
      return this.post('word', 'getList', params)
    },
    getTranslations: (params) => {
      return this.post('word', 'getTranslations', params)
    },
    autocomplete: (params) => {
      return this.post('word', 'autocomplete', params)
    },
    saveItem: (params) => {
      return this.post('word', 'saveItem', params)
    },
    linkLemmas: (params) => {
      return this.post('word', 'linkLemmas', params)
    },
    unlinkLemma: (params) => {
      return this.post('word', 'unlinkLemma', params)
    }
  }
  lemma = {
    getList: (params) => {
      return this.post('lemma', 'getList', params)
    },
    autocomplete: (params) => {
      return this.post('lemma', 'autocomplete', params)
    },
    saveItem: (params) => {
      return this.post('lemma', 'saveItem', params)
    },
    predictList: (params) => {
      return this.post('lemma', 'predictList', params)
    },
  }
  book = {
    getItem: (params) => {
      return this.post('book', 'getItem', params)
    },
    getList: (params) => {
      return this.post('book', 'getList', params)
    },
    saveItem: (params) => {
      return this.post('book', 'saveItem', params)
    },
    buildStart: (params) => {
      return this.post('book', 'buildItemStart', params)
    },
    buildProcess: (params) => {
      return this.post('book', 'buildItemProcess', params)
    },
    buildFinish: (params) => {
      return this.post('book', 'buildItemFinish', params)
    },
  }
  chapter = {
    getItem: (params) => {
      return this.post('chapter', 'getItem', params)
    },
    getList: (params) => {
      return this.post('chapter', 'getList', params)
    },
    createItem: (params) => {
      return this.post('chapter', 'createItem', params)
    },
    deleteItem: (params) => {
      return this.post('chapter', 'deleteItem', params)
    }

  }
  text = {
    getItem: (params) => {
      return this.post('text', 'getItem', params)
    },
    getList: (params) => {
      return this.post('text', 'getList', params)
    },
    saveItem: (params) => {
      return this.post('text', 'saveItem', params)
    },
    deleteItem: (params) => {
      return this.post('text', 'deleteItem', params)
    },
    exportItem: (params) => {
      return this.post('text', 'exportItem', params)
    },
  }
  form = {
    createItemFromLemma: (params) => {
      return this.post('form', 'createItemFromLemma', params)
    }
  }
  language = {
    getList: (params) => {
      return this.post('language', 'getList', params)
    }
  }
  uploader = {
    upload: (params) => {
      return this.post('uploader', 'uploadItem', params)
    }
  }

}
