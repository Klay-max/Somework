(function(){
  document.addEventListener('DOMContentLoaded', function(){
    document.body.classList.add('has-navbar');

    var linksEl = document.querySelector('.navbar .links');
    var burger = document.querySelector('.navbar .hamburger');
    if (burger && linksEl) {
      burger.addEventListener('click', function(){ linksEl.classList.toggle('open'); });
    }

    var current = location.pathname.replace(/\\/g, '/');

    document.querySelectorAll('.navbar a').forEach(function(a){
      var href = a.getAttribute('href') || '';
      var dataPath = a.getAttribute('data-path') || '';
      if (!href && dataPath) {
        if (dataPath.charAt(0) === '/') {
          a.setAttribute('href', dataPath);
        } else {
          var path = current.split('/');
          var depth = path.length - 2; // e.g., /vision/portfolio => depth 2
          var up = '';
          for (var i=0;i<depth;i++){ up += '../'; }
          a.setAttribute('href', up + dataPath);
        }
      }
    });

    document.querySelectorAll('.navbar a').forEach(function(a){
      var href = a.getAttribute('href') || '';
      if (href && href.charAt(0) === '/') {
        if (current === href) a.classList.add('active');
      }
    });
  });
})();
