App = {
  web3Provider: null,
  contracts: {},
	
  init: function() {
    $.getJSON('../company-info.json', function(data) {
      var list = $('#list');
      var template = $('#template');

      for (i = 0; i < data.length; i++) {
        template.find('.id').text(data[i].id);
        template.find('img').attr('src', data[i].picture);
        template.find('.area').text(data[i].area);
        template.find('.price').text(data[i].price);

        list.append(template.html());
      }
    })

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
	  $.getJSON('Company.json', function(data) {
      App.contracts.Company = TruffleContract(data);
      App.contracts.Company.setProvider(App.web3Provider);
      App.listenToEvents();
    });
  },

  checkCompany: function() {	
    var id = $('#id').val();
    var name = $('#name').val();
    var price = $('#price').val();
    var date = $('#date').val();
   
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.Company.deployed().then(function(instance) {
        var nameUtf8Encoded = utf8.encode(name);
        return instance.checkCompany(id, name, date,{ from: account, value: price });
      }).then(function() {
        $('#name').val('');
        $('#date').val('');
        $('#checkModal').modal('hide');  
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  loadCompany: function() {
    App.contracts.Company.deployed().then(function(instance) {
      return instance.getAllManagers.call();
    }).then(function(managers) {
      for (i = 0; i < managers.length; i++) {
        if (managers[i] !== '0x0000000000000000000000000000000000000000') {
          var imgType = $('.panel-company').eq(i).find('img').attr('src').substr(7);
          var count=0;

          switch(imgType) {
            case 'null1.png':
              $('.panel-company').eq(i).find('img').attr('src', 'images/factory_in.png')
              break;
            case 'null2.png':
              $('.panel-company').eq(i).find('img').attr('src', 'images/warehouse_in.png')
              break;
            case 'null3.png':
              $('.panel-company').eq(i).find('img').attr('src', 'images/deliver_in.png')
              break;
            case 'factory_in.png':
             $('.panel-company').eq(i).find('img').attr('src', 'images/factory_out.png')
            break;
            case 'warehouse_in.png':
              $('.panel-company').eq(i).find('img').attr('src', 'images/warehouse_out.png')
            break;
            case 'deliver_in.png':
              $('.panel-company').eq(i).find('img').attr('src', 'images/deliver_out.png')
             break;
          }
         
          if(count==0){$('.panel-company').eq(i).find('.btn-buy').text('출고').attr('disabled',false); count++;}
          
         
          $('.panel-company').eq(i).find('.btn-buyerInfo').removeAttr('style');
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },
	
  listenToEvents: function() {
	  App.contracts.Company.deployed().then(function(instance) {
      instance.LogCheckCompany({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
        var iodate = document.getElementsByName('iodate');
        var iodate_value; 
        for (var i = 0; i < iodate.length; i++) {
            if (iodate[i].checked) {
                iodate_value = iodate[i].value;
            }
        }
        if (!error) {
          if(iodate_value=='입고') $('#events').append('<p>' + event.args._date + ' : ' + event.args._id + '번 센터에 입고 되었습니다. (확인: ' + event.args._manager + ')' + '</p>');
          if(iodate_value=='출고') $('#events').append('<p>' + event.args._date + ' : ' + event.args._id + '번 센터에서 출고 되었습니다. (확인: ' + event.args._manager + ')' + '</p>');
        } 
        else {
          console.error(error);
        }
        App.loadCompany();
      })
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });

  $('#checkModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var price = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.price').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#price').val(price);
  });

  $('#managerInfoModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
   
    App.contracts.Company.deployed().then(function(instance) {
      return instance.getManagerInfo.call(id);
    }).then(function(managerInfo) {
      $(e.currentTarget).find('#managerAddress').text(managerInfo[0]);
      $(e.currentTarget).find('#managerName').text(web3.toUtf8(managerInfo[1]));
      $(e.currentTarget).find('#managerDate').text(managerInfo[2]);
    }).catch(function(err) {
      console.log(err.message);
    })
  });
});
