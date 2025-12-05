(function(){
  document.addEventListener('DOMContentLoaded', function(){
    document.body.classList.add('has-navbar');

    var linksEl = document.querySelector('.navbar .links');
    var burger = document.querySelector('.navbar .hamburger');
    if (burger && linksEl) {
      burger.addEventListener('click', function(){ linksEl.classList.toggle('open'); });
    }

    var inProjects = location.pathname.replace(/\\/g,'/').indexOf('/projects/') !== -1;
    var base = inProjects ? '../../' : './';

    document.querySelectorAll('.navbar a[data-path]').forEach(function(a){
      var p = a.getAttribute('data-path') || '';
      a.setAttribute('href', base + p);
    });

    var current = location.pathname.replace(/\\/g, '/');
    document.querySelectorAll('.navbar a[data-path]').forEach(function(a){
      var target = '/' + a.getAttribute('data-path');
      if (current.endsWith(target)) a.classList.add('active');
      if (!inProjects && a.getAttribute('data-path') === 'index.html') a.classList.add('active');
    });
  });
})();
