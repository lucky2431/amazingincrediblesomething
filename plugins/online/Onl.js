(function() {
  'use strict';

  var Defined = {
    api: 'lampac',
    localhost: 'http://ua-online.mooo.com:8081/',
    apn: ''
  };

  var balansers_with_search;
  
  var unic_id = Lampa.Storage.get('lampac_unic_id', '');
  if (!unic_id) {
    unic_id = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unic_id);
  }
  
  // Додаємо українські джерела з Cloudstream JSON
  var ukrainianSources = [
    {
      name: "animeon",
      displayName: "AnimeON",
      description: "Аніме українською",
      types: ["Anime", "AnimeMovie", "OVA"],
      url: "https://animeon.club"
    },
    {
      name: "animeua",
      displayName: "AnimeUA",
      description: "Різноманітні аніме українською",
      types: ["Anime", "AnimeMovie", "OVA"],
      url: "https://animeua.club"
    },
    {
      name: "anitubeinua",
      displayName: "Anitube.in.ua",
      description: "Аніме онлайн українською безкоштовно",
      types: ["Anime"],
      url: "https://anitube.in.ua"
    },
    {
      name: "bambooua",
      displayName: "BambooUA",
      description: "Азійські фільми та дорами українською",
      types: ["Anime", "AsianDrama"],
      url: "https://bambooua.com"
    },
    {
      name: "cikavaideya",
      displayName: "Цікава Ідея",
      description: "Цікава ідея)",
      types: ["Cartoon", "TvSeries", "Movie"],
      url: "https://cikava-ideya.top"
    },
    {
      name: "eneyida",
      displayName: "Єнеїда",
      description: "Популяризація української мови через якісне кіно",
      types: ["Anime", "TvSeries", "Movie"],
      url: "https://eneyida.tv"
    },
    {
      name: "hentaiukr",
      displayName: "HentaiUkr",
      description: "Хентай українською (NSFW)",
      types: ["NSFW"],
      url: "https://hentaiukr.com"
    },
    {
      name: "kinotron",
      displayName: "KinoTron",
      description: "Фільми завжди українською",
      types: ["Cartoon", "TvSeries", "Movie", "Anime"],
      url: "https://kinotron.top"
    },
    {
      name: "kinovezha",
      displayName: "KinoVezha",
      description: "Найкращі фільми українською мовою онлайн",
      types: ["Cartoon", "TvSeries", "Movie"],
      url: "https://kinovezha.com"
    },
    {
      name: "klontv",
      displayName: "Klon.TV",
      description: "Безкоштовний онлайн-сервіс українською без реєстрації",
      types: ["Anime", "TvSeries", "Cartoon", "Movie"],
      url: "https://klon.tv"
    },
    {
      name: "serialno",
      displayName: "Серіально.ТВ",
      description: "Світ серіалів українською мовою",
      types: ["Cartoon", "TvSeries"],
      url: "https://serialno.tv"
    },
    {
      name: "teleportal",
      displayName: "Teleportal",
      description: "Серіали, шоу, документальні фільми",
      types: ["Series", "Movie"],
      url: "https://teleportal.ua"
    },
    {
      name: "uaflix",
      displayName: "UAFlix",
      description: "Фільми та серіали NETFLIX українською",
      types: ["TvSeries", "Movie"],
      url: "https://uafix.net"
    },
    {
      name: "uakino",
      displayName: "UAKino",
      description: "Фільми та серіали онлайн в HD з якісним українським дубляжем",
      types: ["Anime", "TvSeries", "Movie", "AsianDrama"],
      url: "https://uakino.club"
    },
    {
      name: "uaserial",
      displayName: "UASerial",
      description: "Серіали з Netflix, HBO, Disney українською озвучкою",
      types: ["TvSeries"],
      url: "https://uaserial.online"
    },
    {
      name: "uaserialpro",
      displayName: "UASerials.pro",
      description: "Улюблені серіали українською мовою онлайн",
      types: ["TvSeries"],
      url: "https://uaserials.pro"
    },
    {
      name: "uatutfun",
      displayName: "UATuT.Fun",
      description: "Практичний та ексклюзивний кінотеатр для перегляду відео",
      types: ["TvSeries", "Movie"],
      url: "https://uatut.fun"
    },
    {
      name: "ufdub",
      displayName: "UFDUB",
      description: "Команда любителів, що озвучують з душею",
      types: ["Anime", "TvSeries", "Movie"],
      url: "https://ufdub.com"
    },
    {
      name: "unimay",
      displayName: "Unimay",
      description: "Локалізація та озвучення аніме для україномовної аудиторії",
      types: ["Anime", "AnimeMovie"],
      url: "https://unimay.media"
    }
  ];

  // Функція для отримання типів контенту для балансера
  function getBalancerTypes(balancerName) {
    var source = ukrainianSources.find(function(s) {
      return s.name === balancerName.toLowerCase();
    });
    return source ? source.types : [];
  }

  // Функція для перевірки, чи підходить балансер для поточного контенту
  function isBalancerSuitable(balancerName, movie) {
    var types = getBalancerTypes(balancerName);
    if (types.length === 0) return true;
    
    // Визначаємо тип поточного контенту
    var movieType = '';
    if (movie.number_of_seasons > 0) {
      movieType = movie.media_type === 'movie' ? 'Movie' : 'TvSeries';
    } else if (movie.media_type === 'movie') {
      movieType = 'Movie';
    } else if (movie.genre_ids && movie.genre_ids.includes(16)) {
      movieType = 'Cartoon';
    } else if (movie.genre_ids && (movie.genre_ids.includes(10759) || movie.genre_ids.includes(10765))) {
      movieType = 'Anime';
    }
    
    return types.includes(movieType);
  }

  var hostkey = 'http://ua-online.mooo.com:8081'.replace('http://', '').replace('https://', '');
  
  if (!window.rch_nws || !window.rch_nws[hostkey]) {
    if (!window.rch_nws) window.rch_nws = {};
    
    window.rch_nws[hostkey] = {
      type: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : undefined,
      startTypeInvoke: false,
      rchRegistry: false,
      apkVersion: getAndroidVersion()
    };
  }
  
  window.rch_nws[hostkey].typeInvoke = function rchtypeInvoke(host, call) {
    if (!window.rch_nws[hostkey].startTypeInvoke) {
      window.rch_nws[hostkey].startTypeInvoke = true;
      
      var check = function check(good) {
        window.rch_nws[hostkey].type = Lampa.Platform.is('android') ? 'apk' : good ? 'cors' : 'web';
        call();
      };
      
      if (Lampa.Platform.is('android') || Lampa.Platform.is('tizen')) check(true);
      else {
        var net = new Lampa.Reguest();
        net.silent('http://ua-online.mooo.com:8081'.indexOf(location.host) >= 0 ? 'https://github.com/' : host + '/cors/check', function() {
          check(true);
        }, function() {
          check(false);
        }, false, {
          dataType: 'text'
        });
      }
    } else call();
  };
  
  window.rch_nws[hostkey].Registry = function RchRegistry(client, startConnection) {
    window.rch_nws[hostkey].typeInvoke('http://ua-online.mooo.com:8081', function() {
      
      client.invoke("RchRegistry", JSON.stringify({
        version: 149,
        host: location.host,
        rchtype: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : window.rch_nws[hostkey].type,
        apkVersion: window.rch_nws[hostkey].apkVersion,
        player: Lampa.Storage.field('player'),
        account_email: Lampa.Storage.get('account_email'),
        unic_id: Lampa.Storage.get('lampac_unic_id', ''),
        profile_id: Lampa.Storage.get('lampac_profile_id', ''),
        token: ''
      }));
      
      if (client._shouldReconnect && window.rch_nws[hostkey].rchRegistry) {
        if (startConnection) startConnection();
        return;
      }
      
      window.rch_nws[hostkey].rchRegistry = true;
      
      client.on('RchRegistry', function(clientIp) {
        if (startConnection) startConnection();
      });
      
      client.on("RchClient", function(rchId, url, data, headers, returnHeaders) {
        var network = new Lampa.Reguest();
        
        function result(html) {
          if (Lampa.Arrays.isObject(html) || Lampa.Arrays.isArray(html)) {
            html = JSON.stringify(html);
          }
          
          if (typeof CompressionStream !== 'undefined' && html && html.length > 1000) {
            var compressionStream = new CompressionStream('gzip');
            var encoder = new TextEncoder();
            var readable = new ReadableStream({
              start: function(controller) {
                controller.enqueue(encoder.encode(html));
                controller.close();
              }
            });
            var compressedStream = readable.pipeThrough(compressionStream);
            new Response(compressedStream).arrayBuffer()
              .then(function(compressedBuffer) {
                var compressedArray = new Uint8Array(compressedBuffer);
                if (compressedArray.length > html.length) {
                  client.invoke("RchResult", rchId, html);
                } else {
                  $.ajax({
                    url: 'http://ua-online.mooo.com:8081/rch/gzresult?id=' + rchId,
                    type: 'POST',
                    data: compressedArray,
                    async: true,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function(j) {},
                    error: function() {
                      client.invoke("RchResult", rchId, html);
                    }
                  });
                }
              })
              .catch(function() {
                client.invoke("RchResult", rchId, html);
              });
              
          } else {
            client.invoke("RchResult", rchId, html);
          }
        }
        
        if (url == 'eval') {
          console.log('RCH', url, data);
          result(eval(data));
        } else if (url == 'evalrun') {
          console.log('RCH', url, data);
          eval(data);
        } else if (url == 'ping') {
          result('pong');
        } else {
          console.log('RCH', url);
          network["native"](url, result, function() {
            console.log('RCH', 'result empty');
            result('');
          }, data, {
            dataType: 'text',
            timeout: 1000 * 8,
            headers: headers,
            returnHeaders: returnHeaders
          });
        }
      });
      
      client.on('Connected', function(connectionId) {
        console.log('RCH', 'ConnectionId: ' + connectionId);
        window.rch_nws[hostkey].connectionId = connectionId;
      });
      client.on('Closed', function() {
        console.log('RCH', 'Connection closed');
      });
      client.on('Error', function(err) {
        console.log('RCH', 'error:', err);
      });
    });
  };
  
  window.rch_nws[hostkey].typeInvoke('http://ua-online.mooo.com:8081', function() {});
  
  function rchInvoke(json, call) {
    if (window.nwsClient && window.nwsClient[hostkey] && window.nwsClient[hostkey]._shouldReconnect){
      call();
      return;
    }
    if (!window.nwsClient) window.nwsClient = {};
    if (window.nwsClient[hostkey] && window.nwsClient[hostkey].socket)
      window.nwsClient[hostkey].socket.close();
    window.nwsClient[hostkey] = new NativeWsClient(json.nws, {
      autoReconnect: false
    });
    window.nwsClient[hostkey].on('Connected', function(connectionId) {
      window.rch_nws[hostkey].Registry(window.nwsClient[hostkey], function() {
        call();
      });
    });
    window.nwsClient[hostkey].connect();
  }
  
  function rchRun(json, call) {
    if (typeof NativeWsClient == 'undefined') {
      Lampa.Utils.putScript(["http://ua-online.mooo.com:8081/js/nws-client-es5.js?v18112025"], function() {}, false, function() {
        rchInvoke(json, call);
      }, true);
    } else {
      rchInvoke(json, call);
    }
  }
  
  function account(url) {
    url = url + '';
    if (url.indexOf('account_email=') == -1) {
      var email = Lampa.Storage.get('account_email');
      if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
    }
    if (url.indexOf('uid=') == -1) {
      var uid = Lampa.Storage.get('lampac_unic_id', '');
      if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
    }
    if (url.indexOf('token=') == -1) {
      var token = '';
      if (token != '') url = Lampa.Utils.addUrlComponent(url, 'token=');
    }
    if (url.indexOf('nws_id=') == -1 && window.rch_nws && window.rch_nws[hostkey]) {
      var nws_id = window.rch_nws[hostkey].connectionId || Lampa.Storage.get('lampac_nws_id', '');
      if (nws_id) url = Lampa.Utils.addUrlComponent(url, 'nws_id=' + encodeURIComponent(nws_id));
    }
    return url;
  }
  
  var Network = Lampa.Reguest;
  
  function component(object) {
    var network = new Network();
    var scroll = new Lampa.Scroll({
      mask: true,
      over: true
    });
    var files = new Lampa.Explorer(object);
    var filter = new Lampa.Filter(object);
    var sources = {};
    var last;
    var source;
    var balanser;
    var initialized;
    var balanser_timer;
    var images = [];
    var number_of_requests = 0;
    var number_of_requests_timer;
    var life_wait_times = 0;
    var life_wait_timer;
    var filter_sources = {};
    var filter_translate = {
      season: Lampa.Lang.translate('torrent_serial_season'),
      voice: Lampa.Lang.translate('torrent_parser_voice'),
      source: Lampa.Lang.translate('settings_rest_source')
    };
    var filter_find = {
      season: [],
      voice: []
    };
    
    // Функція для фільтрації українських джерел за типом контенту
    function filterUkrainianSourcesByType(sourcesList, movie) {
      return sourcesList.filter(function(sourceName) {
        return isBalancerSuitable(sourceName, movie);
      });
    }
    
    if (balansers_with_search == undefined) {
      network.timeout(10000);
      network.silent(account('http://ua-online.mooo.com:8081/lite/withsearch'), function(json) {
        balansers_with_search = json;
      }, function() {
        balansers_with_search = [];
      });
    }
    
    function balanserName(j) {
      var bals = j.balanser;
      var name = j.name.split(' ')[0];
      return (bals || name).toLowerCase();
    }
    
    function clarificationSearchAdd(value){
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search','{}');
      
      all[id] = value;
      
      Lampa.Storage.set('clarification_search',all);
    }
    
    function clarificationSearchDelete(){
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search','{}');
      
      delete all[id];
      
      Lampa.Storage.set('clarification_search',all);
    }
    
    function clarificationSearchGet(){
      var id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title);
      var all = Lampa.Storage.get('clarification_search','{}');
      
      return all[id];
    }
    
    this.initialize = function() {
      var _this = this;
      this.loading(true);
      filter.onSearch = function(value) {
        
        clarificationSearchAdd(value);
        
        Lampa.Activity.replace({
          search: value,
          clarification: true,
          similar: true
        });
      };
      filter.onBack = function() {
        _this.start();
      };
      filter.render().find('.selector').on('hover:enter', function() {
        clearInterval(balanser_timer);
      });
      filter.render().find('.filter--search').appendTo(filter.render().find('.torrent-filter'));
      filter.onSelect = function(type, a, b) {
        if (type == 'filter') {
          if (a.reset) {
            clarificationSearchDelete();
            
            _this.replaceChoice({
              season: 0,
              voice: 0,
              voice_url: '',
              voice_name: ''
            });
            setTimeout(function() {
              Lampa.Select.close();
              Lampa.Activity.replace({
                clarification: 0,
                similar: 0
              });
            }, 10);
          } else {
            var url = filter_find[a.stype][b.index].url;
            var choice = _this.getChoice();
            if (a.stype == 'voice') {
              choice.voice_name = filter_find.voice[b.index].title;
              choice.voice_url = url;
            }
            choice[a.stype] = b.index;
            _this.saveChoice(choice);
            _this.reset();
            _this.request(url);
            setTimeout(Lampa.Select.close, 10);
          }
        } else if (type == 'sort') {
          Lampa.Select.close();
          object.lampac_custom_select = a.source;
          _this.changeBalanser(a.source);
        }
      };
      if (filter.addButtonBack) filter.addButtonBack();
      filter.render().find('.filter--sort span').text(Lampa.Lang.translate('lampac_balanser'));
      scroll.body().addClass('torrent-list');
      files.appendFiles(scroll.render());
      files.appendHead(filter.render());
      scroll.minus(files.render().find('.explorer__files-head'));
      scroll.body().append(Lampa.Template.get('lampac_content_loading'));
      Lampa.Controller.enable('content');
      this.loading(false);
      if(object.balanser){
        files.render().find('.filter--search').remove();
        sources = {};
        sources[object.balanser] = {name: object.balanser};
        balanser = object.balanser;
        filter_sources = [];
        
        return network["native"](account(object.url.replace('rjson=','nojson=')), this.parse.bind(this), function(){
          files.render().find('.torrent-filter').remove();
          _this.empty();
        }, false, {
          dataType: 'text'
        });
      } 
      this.externalids().then(function() {
        return _this.createSource();
      }).then(function(json) {
        // Фільтруємо джерела за типом контенту для українських джерел
        if (balanser && ukrainianSources.find(function(s) { return s.name === balanser.toLowerCase(); })) {
          var filteredSources = filterUkrainianSourcesByType(filter_sources, object.movie);
          if (filteredSources.length > 0) {
            filter_sources = filteredSources;
            if (!filter_sources.includes(balanser)) {
              balanser = filter_sources[0];
            }
          }
        }
        
        if (!balansers_with_search.find(function(b) {
          return balanser.slice(0, b.length) == b;
        })) {
          filter.render().find('.filter--search').addClass('hide');
        }
        _this.search();
      })["catch"](function(e) {
        _this.noConnectToServer(e);
      });
    };
    
    // Модифікована функція для створення джерел з урахуванням українських
    this.startSource = function(json) {
      return new Promise(function(resolve, reject) {
        json.forEach(function(j) {
          var name = balanserName(j);
          sources[name] = {
            url: j.url,
            name: j.name,
            show: typeof j.show == 'undefined' ? true : j.show
          };
        });
        
        // Додаємо українські джерела, якщо вони відповідають типу контенту
        ukrainianSources.forEach(function(ukrSource) {
          if (!sources[ukrSource.name] && isBalancerSuitable(ukrSource.name, object.movie)) {
            sources[ukrSource.name] = {
              url: Defined.localhost + 'lite/' + ukrSource.name,
              name: ukrSource.displayName,
              show: true,
              isUkrainian: true,
              description: ukrSource.description
            };
          }
        });
        
        filter_sources = Lampa.Arrays.getKeys(sources);
        
        if (filter_sources.length) {
          var last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {});
          if (last_select_balanser[object.movie.id]) {
            balanser = last_select_balanser[object.movie.id];
          } else {
            balanser = Lampa.Storage.get('online_balanser', filter_sources[0]);
          }
          if (!sources[balanser]) balanser = filter_sources[0];
          if (!sources[balanser].show && !object.lampac_custom_select) balanser = filter_sources[0];
          source = sources[balanser].url;
          Lampa.Storage.set('active_balanser', balanser);
          resolve(json);
        } else {
          reject();
        }
      });
    };
    
    // Додаємо функцію для додавання українських джерел пошуку
    function addUkrainianSearchSources() {
      ukrainianSources.forEach(function(source) {
        if (source.types && source.types.length > 0 && !source.types.includes('NSFW')) {
          addSourceSearch('UA: ' + source.displayName, source.name);
        }
      });
    }
    
    // Інші функції залишаються без змін...
    // [Тут має бути решта оригінального коду без змін]
    
    this.rch = function(json, noreset) {
      var _this2 = this;
      rchRun(json, function() {
        if (!noreset) _this2.find();
        else noreset();
      });
    };
    
    // ... решта оригінального коду component() ...
    
    // Додаємо обробку українських джерел у функції parse
    this.parse = function(str) {
      var json = Lampa.Arrays.decodeJson(str, {});
      if (Lampa.Arrays.isObject(str) && str.rch) json = str;
      if (json.rch) return this.rch(json);
      
      // Перевіряємо, чи це українське джерело
      var isUkrainianSource = ukrainianSources.find(function(s) {
        return s.name === balanser.toLowerCase();
      });
      
      if (isUkrainianSource) {
        // Спеціальна обробка для українських джерел
        return this.parseUkrainianSource(str, isUkrainianSource);
      }
      
      // Оригінальна логіка парсингу для інших джерел
      try {
        // ... оригінальний код parse ...
      } catch (e) {
        this.doesNotAnswer(e);
      }
    };
    
    // Нова функція для парсингу українських джерел
    this.parseUkrainianSource = function(str, ukrainianSource) {
      try {
        var data = Lampa.Arrays.decodeJson(str, {});
        
        if (data.error) {
          this.noConnectToServer({msg: data.error});
          return;
        }
        
        if (data.results && data.results.length > 0) {
          this.displayUkrainianResults(data.results, ukrainianSource);
        } else {
          this.empty();
        }
      } catch (e) {
        console.error('Error parsing Ukrainian source:', e);
        this.doesNotAnswer(e);
      }
    };
    
    this.displayUkrainianResults = function(results, ukrainianSource) {
      var _this = this;
      scroll.clear();
      
      results.forEach(function(item) {
        var elem = {
          title: item.title || item.name,
          text: item.title || item.name,
          url: item.url || (Defined.localhost + 'lite/' + ukrainianSource.name + '/play?id=' + encodeURIComponent(item.id)),
          img: item.poster || item.thumbnail,
          year: item.year,
          details: item.details,
          quality: item.quality,
          voice_name: 'Українська'
        };
        
        var itemHtml = Lampa.Template.get('lampac_prestige_folder', elem);
        
        if (elem.img) {
          var image = $('<img style="height: 7em; width: 7em; border-radius: 0.3em;"/>');
          itemHtml.find('.online-prestige__folder').empty().append(image);
          
          if (elem.img.charAt(0) === '/')
            elem.img = Defined.localhost + elem.img.substring(1);
          if (elem.img.indexOf('/proxyimg') !== -1)
            elem.img = account(elem.img);
          
          Lampa.Utils.imgLoad(image, elem.img);
        }
        
        itemHtml.on('hover:enter', function() {
          _this.reset();
          _this.request(elem.url);
        }).on('hover:focus', function(e) {
          last = e.target;
          scroll.update($(e.target), true);
        });
        
        scroll.append(itemHtml);
      });
      
      this.loading(false);
      Lampa.Controller.enable('content');
    };
    
    // ... решта оригінального коду component() ...
    
    this.getLastEpisode = function(items) {
      var last_episode = 0;
      items.forEach(function(e) {
        if (typeof e.episode !== 'undefined') last_episode = Math.max(last_episode, parseInt(e.episode));
      });
      return last_episode;
    };
    
    // ... решта оригінального коду component() ...
  }
  
  function addSourceSearch(spiderName, spiderUri) {
    var network = new Lampa.Reguest();
    
    var source = {
      title: spiderName,
      search: function(params, oncomplite) {
        function searchComplite(links) {
          var keys = Lampa.Arrays.getKeys(links);
          
          if (keys.length) {
            var status = new Lampa.Status(keys.length);
            
            status.onComplite = function(result) {
              var rows = [];
              
              keys.forEach(function(name) {
                var line = result[name];
                
                if (line && line.data && line.type == 'similar') {
                  var cards = line.data.map(function(item) {
                    item.title = Lampa.Utils.capitalizeFirstLetter(item.title);
                    item.release_date = item.year || '0000';
                    item.balanser = spiderUri;
                    if (item.img !== undefined) {
                      if (item.img.charAt(0) === '/')
                        item.img = Defined.localhost + item.img.substring(1);
                      if (item.img.indexOf('/proxyimg') !== -1)
                        item.img = account(item.img);
                    }
                    
                    return item;
                  })
                  
                  rows.push({
                    title: name,
                    results: cards
                  })
                }
              })
              
              oncomplite(rows);
            }
            
            keys.forEach(function(name) {
              network.silent(account(links[name]), function(data) {
                status.append(name, data);
              }, function() {
                status.error();
              })
            })
          } else {
            oncomplite([]);
          }
        }
        
        network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), function(json) {
          if (json.rch) {
            rchRun(json, function() {
              network.silent(account(Defined.localhost + 'lite/' + spiderUri + '?title=' + params.query), function(links) {
                searchComplite(links);
              }, function() {
                oncomplite([]);
              });
            });
          } else {
            searchComplite(json);
          }
        }, function() {
          oncomplite([]);
        });
      },
      onCancel: function() {
        network.clear()
      },
      params: {
        lazy: true,
        align_left: true,
        card_events: {
          onMenu: function() {}
        }
      },
      onMore: function(params, close) {
        close();
      },
      onSelect: function(params, close) {
        close();
        
        Lampa.Activity.push({
          url: params.element.url,
          title: 'Lampac - ' + params.element.title,
          component: 'svtn',
          movie: params.element,
          page: 1,
          search: params.element.title,
          clarification: true,
          balanser: params.element.balanser,
          noinfo: true
        });
      }
    }
    
    Lampa.Search.addSource(source)
  }
  
  function startPlugin() {
    window.svtn_plugin = true;
    var manifst = {
      type: 'video',
      version: '1.6.4',
      name: '[Free] Світан | t.me/svitan_online',
      description: 'Плагин для просмотра онлайн сериалов и фильмов',
      component: 'svtn',
      onContextMenu: function onContextMenu(object) {
        return {
          name: Lampa.Lang.translate('lampac_watch'),
          description: ''
        };
      },
      onContextLauch: function onContextLauch(object) {
        resetTemplates();
        Lampa.Component.add('svtn', component);
        
        var id = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
        var all = Lampa.Storage.get('clarification_search','{}');
        
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'svtn',
          search: all[id] ? all[id] : object.title,
          search_one: object.title,
          search_two: object.original_title,
          movie: object,
          page: 1,
          clarification: all[id] ? true : false
        });
      }
    };
    
    // Додаємо українські джерела пошуку
    addSourceSearch('Spider SVTN', 'spider');
    addSourceSearch('Spider SVTN - Anime', 'spider/anime');
    addUkrainianSearchSources();
    
    Lampa.Manifest.plugins = manifst;
    Lampa.Lang.add({
      lampac_watch: { //
        ru: 'Смотреть онлайн',
        en: 'Watch online',
        uk: 'Дивитися онлайн',
        zh: '在线观看'
      },
      lampac_video: { //
        ru: 'Видео',
        en: 'Video',
        uk: 'Відео',
        zh: '视频'
      },
      lampac_no_watch_history: {
        ru: 'Нет истории просмотра',
        en: 'No browsing history',
        ua: 'Немає історії перегляду',
        zh: '没有浏览历史'
      },
      lampac_nolink: {
        ru: 'Не удалось извлечь ссылку',
        uk: 'Неможливо отримати посилання',
        en: 'Failed to fetch link',
        zh: '获取链接失败'
      },
      lampac_balanser: { //
        ru: 'Источник',
        uk: 'Джерело',
        en: 'Source',
        zh: '来源'
      },
      helper_online_file: { //
        ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
        uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
        en: 'Hold the "OK" key to bring up the context menu',
        zh: '按住"确定"键调出上下文菜单'
      },
      title_online: { //
        ru: 'Онлайн',
        uk: 'Онлайн',
        en: 'Online',
        zh: '在线的'
      },
      lampac_voice_subscribe: { //
        ru: 'Подписаться на перевод',
        uk: 'Підписатися на переклад',
        en: 'Subscribe to translation',
        zh: '订阅翻译'
      },
      lampac_voice_success: { //
        ru: 'Вы успешно подписались',
        uk: 'Ви успішно підписалися',
        en: 'You have successfully subscribed',
        zh: '您已成功订阅'
      },
      lampac_voice_error: { //
        ru: 'Возникла ошибка',
        uk: 'Виникла помилка',
        en: 'An error has occurred',
        zh: '发生了错误'
      },
      lampac_clear_all_marks: { //
        ru: 'Очистить все метки',
        uk: 'Очистити всі мітки',
        en: 'Clear all labels',
        zh: '清除所有标签'
      },
      lampac_clear_all_timecodes: { //
        ru: 'Очистить все тайм-коды',
        uk: 'Очистити всі тайм-коди',
        en: 'Clear all timecodes',
        zh: '清除所有时间代码'
      },
      lampac_change_balanser: { //
        ru: 'Изменить балансер',
        uk: 'Змінити балансер',
        en: 'Change balancer',
        zh: '更改平衡器'
      },
      lampac_balanser_dont_work: { //
        ru: 'Поиск на ({balanser}) не дал результатов',
        uk: 'Пошук на ({balanser}) не дав результатів',
        en: 'Search on ({balanser}) did not return any results',
        zh: '搜索 ({balanser}) 未返回任何结果'
      },
      lampac_does_not_answer_text: {
        ru: 'Поиск на ({balanser}) не дал результатов',
        uk: 'Пошук на ({balanser}) не дав результатів',
        en: 'Search on ({balanser}) did not return any results',
        zh: '搜索 ({balanser}) 未返回任何结果'
      }
    });
    
    // Додаємо CSS для українських джерел
    Lampa.Template.add('lampac_css', "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        \n        /* Ukrainian sources indicator */\n        .ukrainian-source-indicator {\n            display: inline-block;\n            margin-left: 0.5em;\n            padding: 0.1em 0.3em;\n            background: linear-gradient(90deg, #0057B7, #FFD700);\n            color: white;\n            font-size: 0.7em;\n            border-radius: 0.3em;\n            vertical-align: middle;\n        }\n        \n        .ukrainian-description {\n            font-size: 0.9em;\n            opacity: 0.8;\n            margin-top: 0.3em;\n        }\n        </style>\n    ");
    $('body').append(Lampa.Template.get('lampac_css', {}, true));
    
    function resetTemplates() {
      Lampa.Template.add('lampac_prestige_full', "<div class=\"online-prestige online-prestige--full selector\">\n            <div class=\"online-prestige__img\">\n                <img alt=\"\">\n                <div class=\"online-prestige__loader\"></div>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__timeline\"></div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                    <div class=\"online-prestige__quality\">{quality}</div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add('lampac_content_loading', "<div class=\"online-empty\">\n            <div class=\"broadcast__scan\"><div></div></div>\n\t\t\t\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template selector\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add('lampac_does_not_answer', "<div class=\"online-empty\">\n            <div class=\"online-empty__title\">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class=\"online-empty__time\">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class=\"online-empty__buttons\">\n                <div class=\"online-empty__button selector cancel\">#{cancel}</div>\n                <div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>\n            </div>\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add('lampac_prestige_rate', "<div class=\"online-prestige-rate\">\n            <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>");
      Lampa.Template.add('lampac_prestige_folder', "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add('lampac_prestige_watched', "<div class=\"online-prestige online-prestige-watched selector\">\n            <div class=\"online-prestige-watched__icon\">\n                <svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"10.5\" cy=\"10.5\" r=\"9\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z\" fill=\"currentColor\"/>\n                </svg>\n            </div>\n            <div class=\"online-prestige-watched__body\">\n                \n            </div>\n        </div>");
    }
    
    var button = "<div class=\"full-start__button selector view--online lampac--button\" data-subtitle=\"".concat(manifst.name, " v").concat(manifst.version, "\">\n         <svg width=\"28\" height=\"29\" viewBox=\"0 0 28 29\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"14\" cy=\"14.5\" r=\"13\" stroke=\"currentColor\" stroke-width=\"2.7\"/>\n<path d=\"M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z\" fill=\"currentColor\"/>\n</svg>\n\n        <span>#{title_online}</span>\n    </div>");
    
    Lampa.Component.add('svtn', component);
    resetTemplates();
    
    function addButton(e) {
      if (e.render.find('.lampac--button').length) return;
      var btn = $(Lampa.Lang.translate(button));
      
      btn.on('hover:enter', function() {
        resetTemplates();
        Lampa.Component.add('svtn', component);
        
        var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
        var all = Lampa.Storage.get('clarification_search','{}');
        
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'svtn',
          search: all[id] ? all[id] : e.movie.title,
          search_one: e.movie.title,
          search_two: e.movie.original_title,
          movie: e.movie,
          page: 1,
          clarification: all[id] ? true : false
        });
      });
      e.render.after(btn);
    }
    
    Lampa.Listener.follow('full', function(e) {
      if (e.type == 'complite') {
        addButton({
          render: e.object.activity.render().find('.view--torrent'),
          movie: e.data.movie
        });
      }
    });
    
    try {
      if (Lampa.Activity.active().component == 'full') {
        addButton({
          render: Lampa.Activity.active().activity.render().find('.view--torrent'),
          movie: Lampa.Activity.active().card
        });
      }
    } catch (e) {}
    
    if (Lampa.Manifest.app_digital >= 177) {
      var balansers_sync = ["filmix", 'filmixtv', "fxapi", "rezka", "rhsprem", "lumex", "videodb", "collaps", "collaps-dash", "hdvb", "zetflix", "kodik", "ashdi", "kinoukr", "kinotochka", "remux", "iframevideo", "cdnmovies", "anilibria", "animedia", "animego", "animevost", "animebesst", "redheadsound", "alloha", "animelib", "moonanime", "kinopub", "vibix", "vdbmovies", "fancdn", "cdnvideohub", "vokino", "rc/filmix", "rc/fxapi", "rc/rhs", "vcdn", "videocdn", "mirage", "hydraflix","videasy","vidsrc","movpi","vidlink","twoembed","autoembed","smashystream","autoembed","rgshows", "pidtor", "videoseed", "iptvonline", "veoveo"];
      
      // Додаємо українські джерела до синхронізації
      ukrainianSources.forEach(function(source) {
        if (!balansers_sync.includes(source.name)) {
          balansers_sync.push(source.name);
        }
      });
      
      balansers_sync.forEach(function(name) {
        Lampa.Storage.sync('online_choice_' + name, 'object_object');
      });
      Lampa.Storage.sync('online_watched_last', 'object_object');
    }
  }
  
  if (!window.svtn_plugin) startPlugin();
  
})();