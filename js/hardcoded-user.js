/* Hardcoded single user */
(function(){
  'use strict';
  try {
    var allowed = [{name: 'Luqman', email: 'annanluqman@gmail.com', password: 'luqman21541037$'}];
    localStorage.setItem('golive_users', JSON.stringify(allowed));
  } catch(e) {}
  // Also ensure events exist
  try {
    if(!localStorage.getItem('golive_events')){
      var seed=[
        {id:'ev-1',title:"WORLD TOUR 'ARIRANG' IN KUALA LUMPUR",artist:'BTS',date:'12 Dec 2026',venue:'TM Stadium Nasional',time:'7:30 PM',category:'Concert',priceFrom:1288,imageUrl:'https://images.unsplash.com/photo-1603012870030-8f10a8fd0b9d?w=1200',status:'trending',featured:true},
        {id:'ev-2',title:'WORLD TOUR IN KUALA LUMPUR',artist:'BLACKPINK',date:'24 Jan 2027',venue:'Axiata Arena',time:'8:00 PM',category:'Concert',priceFrom:538,imageUrl:'https://images.unsplash.com/photo-1614683505751-dff6021b4d8e?w=1200',status:'onSale',featured:true},
        {id:'ev-3',title:'Westlife - The Hits Tour',artist:'Westlife',date:'5 Mar 2027',venue:'National Stadium Bukit Jalil',time:'8:00 PM',category:'Concert',priceFrom:298,imageUrl:'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200',status:'upcoming',featured:true},
        {id:'ev-5',title:'After Hours Til Dawn Tour',artist:'The Weeknd',date:'22 May 2027',venue:'Axiata Arena',time:'8:00 PM',category:'Concert',priceFrom:458,imageUrl:'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200',status:'trending',featured:true},
        {id:'ev-6',title:'Love On Tour',artist:'Harry Styles',date:'8 Jun 2027',venue:'TM Stadium Nasional',time:'7:30 PM',category:'Concert',priceFrom:688,imageUrl:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',status:'upcoming',featured:true},
        {id:'ev-8',title:'Renaissance World Tour',artist:'Beyoncé',date:'12 Aug 2027',venue:'Axiata Arena',time:'8:00 PM',category:'Concert',priceFrom:798,imageUrl:'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200',status:'upcoming',featured:true}
      ];
      localStorage.setItem('golive_events', JSON.stringify(seed));
    }
  } catch(e){}
})();
