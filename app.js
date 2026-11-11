'use strict';

/* ---- Hosted-version extras ---- */
// Refuse to run inside someone else's frame (clickjacking protection; GitHub Pages can't send X-Frame-Options)
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.innerHTML = ''; } }
// Offline support
if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); }); }

(function(){
'use strict';

/* ------------------------------------------------------------------
   1. INGREDIENTS — rough Sainsbury's prices (estimates, Nov 2026).
   I(id, name, aisle, unit, packSize, packPrice, staple, packLabel, searchTerm)
   unit is one of: g, ml, each, tin, clove, tsp, tbsp
   ------------------------------------------------------------------ */
const AISLES=['Fruit & veg','Meat & fish','Dairy & eggs','Chilled','Bakery','Pasta, rice & grains','Tins & jars','World foods','Frozen','Cupboard','Other'];
const [FV,MF,DE,CH,BK,PR,TJ,WF,FZ,CB]=AISLES;
const ING={};
function I(id,name,aisle,unit,pack,price,staple,pl,q){ING[id]={id,name,aisle,unit,pack,price,staple:!!staple,pl:pl||'',q:q||''};}

I('onion','Brown onion',FV,'each',1,0.20,0,'loose','brown onions');
I('red_onion','Red onion',FV,'each',1,0.25,0,'loose','red onions');
I('garlic','Garlic',FV,'clove',10,0.45,0,'bulb','garlic bulb');
I('ginger','Root ginger',FV,'g',100,0.60,0,'piece (~100g)','root ginger');
I('carrot','Carrots',FV,'g',1000,0.65,0,'1kg bag','carrots');
I('potato','White potatoes',FV,'g',2000,1.55,0,'2kg bag','white potatoes');
I('baby_potato','Baby potatoes',FV,'g',1000,1.25,0,'1kg bag','baby potatoes');
I('sweet_potato','Sweet potatoes',FV,'g',1000,1.40,0,'1kg','sweet potatoes');
I('pepper','Mixed peppers',FV,'each',3,1.60,0,'pack of 3','mixed peppers');
I('courgette','Courgette',FV,'each',1,0.55,0,'loose','courgette');
I('broccoli','Broccoli',FV,'each',1,0.79,0,'head','broccoli');
I('spinach','Baby spinach',FV,'g',200,1.25,0,'','baby spinach');
I('mushroom','Closed cup mushrooms',FV,'g',300,1.05,0,'','closed cup mushrooms');
I('cherry_tom','Cherry tomatoes',FV,'g',330,1.00,0,'','cherry tomatoes');
I('lemon','Lemon',FV,'each',1,0.35,0,'loose','lemons');
I('lime','Lime',FV,'each',1,0.30,0,'loose','limes');
I('spring_onion','Spring onions',FV,'each',8,0.60,0,'bunch','spring onions');
I('coriander','Fresh coriander',FV,'g',30,0.75,0,'','fresh coriander');
I('parsley','Fresh flat-leaf parsley',FV,'g',30,0.75,0,'','flat leaf parsley');
I('basil','Fresh basil',FV,'g',30,0.85,0,'','fresh basil');
I('leek','Leek',FV,'each',1,0.60,0,'loose','leeks');
I('salad','Mixed salad leaves',FV,'g',120,1.00,0,'','mixed salad leaves');
I('avocado','Avocado',FV,'each',1,0.90,0,'loose','avocado');
I('green_beans','Green beans',FV,'g',220,1.20,0,'','green beans');
I('beansprouts','Beansprouts',FV,'g',300,0.75,0,'','beansprouts');
I('cucumber','Cucumber',FV,'each',1,0.75,0,'whole','cucumber');

I('chicken_breast','Chicken breast fillets',MF,'g',640,5.50,0,'','chicken breast fillets');
I('chicken_thigh','Boneless chicken thigh fillets',MF,'g',500,3.85,0,'','chicken thigh fillets boneless');
I('beef_mince','Beef mince (12% fat)',MF,'g',500,3.85,0,'','beef mince 12%');
I('beef_strips','Beef stir-fry strips',MF,'g',300,4.25,0,'','beef stir fry strips');
I('pork_mince','Pork mince',MF,'g',500,3.25,0,'','pork mince');
I('sausages','Pork sausages',MF,'each',6,2.75,0,'pack of 6','pork sausages');
I('lardons','Smoked bacon lardons',MF,'g',200,2.00,0,'','smoked bacon lardons');
I('chorizo','Chorizo ring',MF,'g',225,2.60,0,'','chorizo ring');
I('pork_loin','Pork loin steaks',MF,'each',4,4.00,0,'pack of 4','pork loin steaks');
I('salmon','Salmon fillets',MF,'each',2,4.50,0,'pack of 2','salmon fillets');
I('cod','Cod fillets',MF,'each',2,5.25,0,'pack of 2','cod fillets');
I('prawns','Raw king prawns',MF,'g',180,3.75,0,'','raw king prawns');

I('eggs','Free range eggs',DE,'each',6,1.85,0,'box of 6','free range eggs 6');
I('milk','Semi-skimmed milk',DE,'ml',1136,1.45,0,'2 pints','semi skimmed milk 2 pints');
I('cheddar','Mature cheddar',DE,'g',350,3.20,0,'','mature cheddar');
I('parmesan','Italian-style hard cheese',DE,'g',150,2.25,0,'','italian hard cheese');
I('mozzarella','Mozzarella',DE,'g',125,0.85,0,'ball','mozzarella');
I('feta','Greek feta',DE,'g',200,2.00,0,'','feta');
I('halloumi','Halloumi',DE,'g',225,2.75,0,'','halloumi');
I('creme_fraiche','Half-fat crème fraîche',DE,'ml',300,1.40,0,'','half fat creme fraiche');
I('double_cream','Double cream',DE,'ml',300,1.65,0,'','double cream');
I('sour_cream','Soured cream',DE,'ml',300,1.00,0,'','soured cream');
I('yoghurt','Greek-style yoghurt',DE,'g',500,1.20,0,'','greek style yogurt');

I('puff_pastry','Ready-rolled puff pastry',CH,'g',320,1.50,0,'','ready rolled puff pastry');
I('gnocchi','Fresh gnocchi',CH,'g',500,1.25,0,'','gnocchi');
I('tofu','Firm tofu',CH,'g',396,2.25,0,'','firm tofu');

I('wraps','Tortilla wraps',BK,'each',8,1.15,0,'pack of 8','tortilla wraps');
I('buns','Brioche burger buns',BK,'each',4,1.50,0,'pack of 4','brioche burger buns');
I('naan','Plain naan breads',BK,'each',2,1.00,0,'pack of 2','plain naan');
I('pitta','White pitta breads',BK,'each',6,0.85,0,'pack of 6','white pitta');
I('garlic_bread','Garlic baguette',BK,'each',1,1.00,0,'each','garlic baguette');

I('spaghetti','Spaghetti',PR,'g',500,0.75,0,'','spaghetti 500g');
I('penne','Penne',PR,'g',500,0.75,0,'','penne 500g');
I('orzo','Orzo',PR,'g',500,1.20,0,'','orzo');
I('lasagne','Lasagne sheets',PR,'g',250,0.90,0,'','lasagne sheets');
I('rice','Basmati rice',PR,'g',1000,2.25,0,'1kg bag','basmati rice 1kg');
I('risotto_rice','Risotto rice',PR,'g',500,1.50,0,'','risotto rice');
I('egg_noodles','Medium egg noodles',PR,'g',300,1.00,0,'','medium egg noodles');
I('rice_noodles','Rice noodles',PR,'g',250,1.25,0,'','rice noodles');
I('couscous','Couscous',PR,'g',500,1.00,0,'','couscous');
I('panko','Panko breadcrumbs',PR,'g',150,1.50,0,'','panko breadcrumbs');
I('red_lentils','Red split lentils',PR,'g',500,1.25,0,'','red split lentils');

I('chopped_tom','Chopped tomatoes',TJ,'tin',1,0.55,0,'400g tin','chopped tomatoes 400g');
I('passata','Passata',TJ,'g',500,0.70,0,'','passata');
I('kidney','Red kidney beans',TJ,'tin',1,0.60,0,'400g tin','red kidney beans');
I('chickpeas','Chickpeas',TJ,'tin',1,0.60,0,'400g tin','chickpeas tin');
I('black_beans','Black beans',TJ,'tin',1,0.75,0,'400g tin','black beans tin');
I('butter_beans','Butter beans',TJ,'tin',1,0.65,0,'400g tin','butter beans tin');
I('sweetcorn','Sweetcorn',TJ,'tin',1,0.65,0,'325g tin','sweetcorn tin');
I('coconut','Coconut milk',TJ,'tin',1,1.20,0,'400ml tin','coconut milk');
I('tuna','Tuna chunks in spring water',TJ,'tin',1,1.15,0,'145g tin','tuna chunks spring water');
I('pesto','Green pesto',TJ,'g',190,1.50,0,'190g jar','green pesto');
I('salsa','Tomato salsa',TJ,'g',300,1.25,0,'300g jar','tomato salsa');

I('red_curry','Thai red curry paste',WF,'g',114,1.75,0,'jar','thai red curry paste');
I('tikka_paste','Tikka masala curry paste',WF,'g',283,2.25,0,'jar','tikka masala paste');
I('curry_paste','Korma curry paste',WF,'g',283,2.25,0,'jar','korma curry paste');
I('hoisin','Hoisin sauce',WF,'g',210,1.30,0,'jar','hoisin sauce');

I('peas','Garden peas (frozen)',FZ,'g',900,1.30,0,'900g bag','frozen garden peas');

I('olive_oil','Olive oil',CB,'tbsp',33,4.75,1,'500ml bottle','olive oil');
I('sesame_oil','Toasted sesame oil',CB,'tsp',30,2.00,1,'150ml bottle','sesame oil');
I('soy','Soy sauce',CB,'tbsp',10,1.00,1,'150ml bottle','soy sauce');
I('honey','Runny honey',CB,'tbsp',16,1.60,1,'340g jar','runny honey');
I('tom_puree','Tomato purée',CB,'tbsp',12,0.85,1,'200g tube','tomato puree');
I('stock_chicken','Chicken stock cubes',CB,'each',10,1.10,1,'pack of 10','chicken stock cubes');
I('stock_beef','Beef stock cubes',CB,'each',10,1.10,1,'pack of 10','beef stock cubes');
I('stock_veg','Vegetable stock cubes',CB,'each',10,1.10,1,'pack of 10','vegetable stock cubes');
I('flour','Plain flour',CB,'g',1500,0.95,1,'1.5kg bag','plain flour');
I('cornflour','Cornflour',CB,'tsp',80,1.10,1,'250g box','cornflour');
I('butter','Butter',CB,'g',250,2.40,1,'250g block','butter');
I('worcester','Worcestershire sauce',CB,'tbsp',10,1.30,1,'150ml bottle','worcestershire sauce');
I('dijon','Dijon mustard',CB,'tsp',36,1.20,1,'180g jar','dijon mustard');
I('mayo','Mayonnaise',CB,'tbsp',26,2.00,1,'400ml jar','mayonnaise');
I('peanut_butter','Peanut butter',CB,'tbsp',21,1.70,1,'340g jar','smooth peanut butter');
I('gravy','Gravy granules',CB,'tbsp',25,1.60,1,'200g tub','gravy granules');
I('smoked_paprika','Smoked paprika',CB,'tsp',20,1.10,1,'jar','smoked paprika');
I('cumin','Ground cumin',CB,'tsp',20,1.10,1,'jar','ground cumin');
I('chilli_flakes','Chilli flakes',CB,'tsp',15,1.10,1,'jar','chilli flakes');
I('oregano','Dried oregano',CB,'tsp',15,1.10,1,'jar','dried oregano');
I('curry_powder','Medium curry powder',CB,'tsp',40,1.10,1,'jar','medium curry powder');
I('turmeric','Ground turmeric',CB,'tsp',20,1.00,1,'jar','ground turmeric');
I('garam','Garam masala',CB,'tsp',20,1.10,1,'jar','garam masala');
I('cumin_seeds','Cumin seeds',CB,'tsp',20,1.10,1,'jar','cumin seeds');
I('chilli_powder','Mild chilli powder',CB,'tsp',20,1.10,1,'jar','mild chilli powder');
I('bbq','BBQ sauce',CB,'tbsp',30,1.50,1,'480g bottle','bbq sauce');
I('sesame_seeds','Sesame seeds',CB,'tsp',30,1.20,1,'jar','sesame seeds');

/* Added Nov 2026 for the HelloFresh / Waitrose / Good Food / Swasthi's style curries */
I('mango_chutney','Mango chutney',TJ,'g',340,1.30,0,'340g jar','mango chutney');
I('korma_sauce','Korma cooking sauce',TJ,'g',500,1.30,0,'500g jar','korma cooking sauce');
I('crispy_onions','Crispy fried onions',TJ,'g',100,1.20,0,'100g tub','crispy fried onions');
I('kale','Kale',FV,'g',200,1.00,0,'200g bag','kale');
I('cauliflower','Cauliflower',FV,'each',1,1.00,0,'whole','cauliflower');
I('mint','Fresh mint',FV,'g',30,0.75,0,'','fresh mint');
I('pak_choi','Pak choi',FV,'each',2,1.10,0,'pack of 2','pak choi');
I('yellow_curry','Thai yellow curry paste',WF,'g',100,1.75,0,'jar','thai yellow curry paste');
I('gochujang','Gochujang paste',WF,'g',170,2.25,0,'jar','gochujang');
I('jasmine_rice','Jasmine rice',PR,'g',1000,2.50,0,'1kg bag','jasmine rice 1kg');
I('cashews','Cashew nuts',CB,'g',200,2.40,0,'200g bag','cashew nuts');
I('peanuts','Salted peanuts',CB,'g',200,1.00,0,'200g bag','salted peanuts');
I('shallot','Shallots',FV,'each',8,1.00,0,'pack (~400g)','shallots');
I('red_chilli','Red chillies',FV,'each',3,0.65,0,'pack of 3','red chillies');
I('lemongrass','Lemongrass',FV,'each',4,1.00,0,'pack of 4','lemongrass');
I('ketjap','Ketjap manis (sweet soy sauce)',WF,'tbsp',16,2.00,0,'250ml bottle','kecap manis');
I('fish_sauce','Fish sauce',WF,'tbsp',13,1.60,0,'200ml bottle','fish sauce');
I('madras_paste','Madras curry paste',WF,'g',283,2.25,0,'jar','madras curry paste');
I('five_spice','Chinese five spice',CB,'tsp',20,1.10,1,'jar','chinese five spice');
I('ground_coriander','Ground coriander',CB,'tsp',20,1.10,1,'jar','ground coriander');
I('rice_vinegar','Rice vinegar',CB,'tbsp',10,1.50,1,'150ml bottle','rice vinegar');
I('udon','Udon noodles (straight to wok)',WF,'g',300,1.50,0,'2 x 150g','udon noodles');
I('soba','Soba noodles',WF,'g',250,1.75,0,'250g pack','soba noodles');
I('miso','White miso paste',WF,'g',100,2.25,0,'jar','white miso paste');
I('sweet_chilli','Sweet chilli sauce',WF,'tbsp',20,1.25,0,'300ml bottle','sweet chilli sauce');
I('black_bean_sauce','Black bean sauce',WF,'g',195,1.50,0,'jar','black bean sauce');
I('stir_fry_veg','Stir-fry vegetable mix',FV,'g',300,1.25,0,'300g bag','stir fry vegetables');
I('chinese_leaf','Chinese leaf',FV,'each',1,0.90,0,'whole','chinese leaf');
I('dill','Fresh dill',FV,'g',30,0.75,0,'','fresh dill');
I('pineapple','Pineapple chunks in juice',TJ,'tin',1,1.00,0,'432g tin','pineapple chunks tin');
I('broad_beans','Broad beans (frozen)',FZ,'g',750,2.00,0,'750g bag','frozen broad beans');
I('pistachios','Shelled pistachios',CB,'g',100,2.75,0,'100g bag','shelled pistachios');
I('linguine','Linguine',PR,'g',500,0.95,0,'','linguine 500g');
I('rigatoni','Rigatoni',PR,'g',500,0.95,0,'','rigatoni 500g');
I('macaroni','Macaroni',PR,'g',500,0.85,0,'','macaroni 500g');
I('ravioli','Spinach & ricotta ravioli (fresh)',CH,'g',300,2.00,0,'300g pack','spinach ricotta ravioli');
I('fresh_lasagne','Fresh egg lasagne sheets',CH,'g',250,1.60,0,'250g pack','fresh lasagne sheets');
I('lamb_mince','Lamb mince',MF,'g',500,5.25,0,'','lamb mince');
I('pancetta','Cubetti di pancetta',MF,'g',130,2.25,0,'2 x 65g','cubetti di pancetta');
I('cream_cheese','Soft cheese',DE,'g',180,1.00,0,'180g tub','soft cheese');
I('ricotta','Ricotta',DE,'g',250,1.50,0,'250g tub','ricotta');
I('blue_cheese','Blue Stilton',DE,'g',200,2.75,0,'','blue stilton');
I('asparagus','Asparagus',FV,'g',250,2.00,0,'bunch','asparagus');
I('butternut','Butternut squash',FV,'each',1,1.25,0,'whole','butternut squash');
I('rosemary','Fresh rosemary',FV,'g',20,0.80,0,'','fresh rosemary');
I('roasted_peppers','Roasted red peppers (jar)',TJ,'g',460,1.50,0,'460g jar','roasted red peppers jar');
I('piquante','Sweet piquanté peppers',TJ,'g',375,1.85,0,'375g jar','sweet piquante peppers');
I('green_lentils','Green lentils',TJ,'tin',1,0.75,0,'400g tin','green lentils tin');
I('porcini','Dried porcini mushrooms',CB,'g',30,2.50,0,'30g pack','dried porcini');
I('truffle_oil','Truffle-infused olive oil',CB,'tsp',50,3.25,0,'250ml bottle','truffle oil');
I('vodka','Vodka',CB,'ml',50,2.00,0,'5cl miniature','vodka miniature');
I('cajun','Cajun seasoning',CB,'tsp',15,1.10,1,'jar','cajun seasoning');
I('sea_bass','Sea bass fillets',MF,'each',2,4.75,0,'pack of 2','sea bass fillets');
I('hake','Hake fillets',MF,'each',2,4.50,0,'pack of 2','hake fillets');
I('capers','Capers',TJ,'g',100,1.10,0,'100g jar','capers');
I('chipotle','Chipotle paste',WF,'g',95,1.75,0,'jar','chipotle paste');
I('tarragon','Fresh tarragon',FV,'g',20,0.80,0,'','fresh tarragon');
I('spring_greens','Sliced spring greens',FV,'g',200,1.00,0,'200g bag','spring greens');
I('red_cabbage','Red cabbage',FV,'each',1,0.85,0,'whole','red cabbage');
I('mini_wraps','Mini tortilla wraps',BK,'each',10,1.20,0,'pack of 10','mini tortilla wraps');
I('prosciutto','Prosciutto crudo',MF,'g',80,2.50,0,'80g pack','prosciutto');
I('pizza_bases','Pizza bases',BK,'each',2,1.50,0,'pack of 2','pizza bases');
I('flatbread','Plain flatbreads',BK,'each',4,1.25,0,'pack of 4','plain flatbreads');
I('steak','Beef rump steaks',MF,'each',2,6.50,0,'pack of 2','beef rump steak');
I('ciabatta','Ciabatta rolls',BK,'each',4,1.35,0,'pack of 4','ciabatta rolls');
I('portobello','Portobello mushrooms',FV,'each',4,1.75,0,'pack of 4','portobello mushrooms');
I('cranberry','Cranberry sauce',TJ,'tbsp',13,1.20,0,'200g jar','cranberry sauce');
I('harissa','Harissa paste',WF,'g',90,1.25,0,'90g jar','harissa paste');
I('bulgur','Bulgur wheat',PR,'g',500,1.25,0,'500g bag','bulgur wheat');
I('pomegranate','Pomegranate seeds',FV,'g',100,1.25,0,'100g pot','pomegranate seeds');
I('apricots','Dried apricots',CB,'g',250,1.50,0,'250g bag','dried apricots');
I('streaky_bacon','Smoked streaky bacon',MF,'each',12,2.25,0,'pack of 12 rashers','smoked streaky bacon');
I('ras_el_hanout','Ras el hanout',CB,'tsp',15,1.25,1,'jar','ras el hanout');
I('cinnamon','Ground cinnamon',CB,'tsp',20,1.00,1,'jar','ground cinnamon');
I('mascarpone','Mascarpone',DE,'g',250,1.75,0,'250g tub','mascarpone');
I('gruyere','Gruyère',DE,'g',150,2.75,0,'','gruyere');
I('baguette','Baguette',BK,'each',1,0.85,0,'each','baguette');
I('little_gem','Little gem lettuce',FV,'each',2,0.85,0,'pack of 2','little gem lettuce');
I('tandoori_paste','Tandoori curry paste',WF,'g',283,2.25,0,'jar','tandoori curry paste');

/* ------------------------------------------------------------------
   2. BUILT-IN RECIPES — all for 2 servings; the app scales them.
   R(id, name, emoji, type, cuisine, minutes, description, 'ingId qty, ...', 'step|step|...')
   ------------------------------------------------------------------ */
function R(id,n,e,t,c,m,d,ings,steps){
  return {id,n,e,t,c,m,s:2,d,i:ings.split(',').map(x=>{const p=x.trim().split(/\s+/);return [p[0],parseFloat(p[1])];}),st:steps.split('|')};
}
const BUILT=[
R('fajitas','Sizzling chicken fajitas','🌯','chicken','Mexican',25,'Smoky spiced chicken and peppers, wrapped up with cheese and soured cream.',
'chicken_breast 300, pepper 2, red_onion 1, wraps 4, smoked_paprika 1, cumin 1, lime 1, sour_cream 75, cheddar 40, olive_oil 1',
'Slice the chicken, peppers and onion into thin strips.|Toss the chicken with the paprika, cumin, oil and a pinch of salt.|Fry the chicken in a hot pan for 4 min, add the peppers and onion and cook for 5–6 min more until the chicken is cooked through.|Squeeze over half the lime. Warm the wraps in a dry pan or the microwave.|Fill the wraps with the chicken, grated cheese and soured cream. Serve with lime wedges.'),
R('bolognese','Weeknight spaghetti bolognese','🍝','beef','Italian',40,'A rich, slow-tasting ragù that is ready in under an hour.',
'beef_mince 250, onion 1, carrot 100, garlic 2, chopped_tom 1, tom_puree 1, oregano 1, stock_beef 1, spaghetti 180, parmesan 20, olive_oil 1',
'Finely chop the onion and garlic and grate the carrot.|Fry the onion and carrot in the oil for 5 min, then add the garlic and mince and brown for 5 min, breaking it up.|Stir in the purée, oregano, chopped tomatoes and the stock cube dissolved in 150ml boiling water. Simmer for 20 min.|Meanwhile cook the spaghetti in salted boiling water. Drain, keeping a splash of the water.|Toss the pasta through the sauce with a splash of pasta water and serve topped with grated cheese.'),
R('tikka','Chicken tikka masala','🍛','chicken','Indian',35,'Tender chicken thighs in a creamy, gently spiced tomato sauce.',
'chicken_thigh 300, onion 1, garlic 2, ginger 10, tikka_paste 60, chopped_tom 1, double_cream 75, rice 150, coriander 10, olive_oil 1',
'Cut the chicken into chunks. Chop the onion, garlic and ginger.|Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Fry the onion in the oil for 5 min, add the garlic, ginger, chicken and curry paste and cook for 5 min.|Add the chopped tomatoes and simmer for 12 min until the chicken is cooked through.|Stir in the cream, season, and serve over the rice with chopped coriander.'),
R('red-curry','Thai red chicken curry','🥥','chicken','Thai',25,'Fragrant coconut curry with crunchy green beans and peppers.',
'chicken_thigh 300, red_curry 40, coconut 1, pepper 1, green_beans 100, rice 150, lime 1, coriander 10, olive_oil 1',
'Cook the rice. Slice the chicken, pepper and trim the beans.|Fry the curry paste in the oil for 1 min, add the chicken and cook for 4 min.|Pour in the coconut milk, add the pepper and beans and simmer for 8–10 min until the chicken is cooked.|Squeeze in half the lime and season.|Serve with the rice, coriander and lime wedges.'),
R('tuscan','Creamy Tuscan chicken','🍗','chicken','Italian',30,'Golden chicken in a garlicky cream sauce with tomatoes and spinach.',
'chicken_breast 300, garlic 2, cherry_tom 150, spinach 80, double_cream 150, parmesan 20, baby_potato 400, oregano 1, olive_oil 1',
'Halve the potatoes and boil for 15 min until tender.|Season the chicken with oregano, salt and pepper and fry in the oil for 6–7 min each side until cooked. Set aside.|In the same pan, cook the garlic and halved tomatoes for 3 min.|Add the cream and cheese, simmer for 2 min, then stir in the spinach to wilt.|Return the chicken to the pan and serve with the potatoes.'),
R('honey-garlic','Honey garlic chicken noodles','🍜','chicken','Chinese',20,'Sticky, savoury noodles that beat a takeaway on a weeknight.',
'chicken_breast 300, egg_noodles 150, pepper 1, broccoli 0.5, spring_onion 3, garlic 2, ginger 10, soy 2, honey 1, olive_oil 1',
'Slice the chicken, pepper and spring onions; cut the broccoli into small florets.|Cook the noodles following the pack, then drain.|Stir-fry the chicken in the oil for 5 min, add the veg and cook for 3 min.|Add the garlic and ginger for 1 min, then the soy and honey.|Toss in the noodles until glossy and serve topped with spring onion.'),
R('katsu','Chicken katsu curry','🍱','chicken','Japanese',40,'Crispy panko chicken with a sweet, mild curry sauce and rice.',
'chicken_breast 300, panko 60, eggs 1, flour 30, onion 1, carrot 100, garlic 2, curry_powder 2, stock_chicken 1, honey 1, soy 1, rice 150, olive_oil 3',
'Heat the oven to 200°C (180°C fan). Bash the chicken to an even thickness.|Dust the chicken in a little flour, dip in beaten egg, then press into the panko. Drizzle with 2 tbsp oil and bake for 20–25 min.|Meanwhile fry the chopped onion and carrot in the rest of the oil for 5 min, add the garlic, curry powder and 1 tbsp of the flour.|Stir in the stock cube with 300ml water, honey and soy. Simmer for 10 min then blend or mash until smooth.|Cook the rice. Slice the chicken and serve with the rice and sauce.'),
R('chorizo-tray','Chicken & chorizo traybake','🫑','chicken','Spanish',45,'One tray, smoky paprika juices and crispy potatoes.',
'chicken_thigh 350, chorizo 80, baby_potato 400, pepper 1, red_onion 1, smoked_paprika 1, cherry_tom 150, olive_oil 1',
'Heat the oven to 200°C (180°C fan).|Halve the potatoes, chop the pepper and onion into wedges and slice the chorizo.|Toss everything except the tomatoes with the oil, paprika and seasoning in a roasting tin.|Roast for 25 min, add the tomatoes and roast for 10–15 min more until the chicken is cooked through.'),
R('peri','Peri-peri chicken rice bowls','🔥','chicken','Portuguese',30,'Lemony, smoky chicken over spiced rice with a cooling yoghurt drizzle.',
'chicken_thigh 300, rice 150, pepper 1, sweetcorn 0.5, smoked_paprika 1, chilli_flakes 0.5, lemon 1, garlic 2, yoghurt 100, stock_chicken 1, olive_oil 1',
'Mix the paprika, chilli, crushed garlic, half the lemon juice and the oil. Coat the chicken.|Cook the rice in 300ml water with the stock cube for 12 min, covered.|Fry the chicken for 6–7 min each side until cooked and charred. Slice.|Fry the chopped pepper and sweetcorn for 4 min and stir through the rice.|Top the rice with the chicken and spoon over yoghurt mixed with the remaining lemon.'),
R('caesar-wrap','Chicken Caesar wraps','🥗','chicken','American',20,'Crunchy lettuce, garlicky dressing and juicy chicken, rolled up.',
'chicken_breast 250, wraps 4, salad 80, parmesan 20, mayo 3, lemon 0.5, garlic 1, dijon 1, olive_oil 1',
'Season the chicken and fry in the oil for 6–7 min each side until cooked. Slice.|Mix the mayo, lemon juice, crushed garlic, mustard and half the cheese to make the dressing.|Toss the salad leaves in the dressing.|Fill the wraps with the salad and chicken, scatter over the rest of the cheese and roll up.'),
R('pie','Chicken, leek & mushroom pie','🥧','chicken','British',50,'A creamy filling under a crisp puff pastry lid.',
'chicken_thigh 350, leek 1, mushroom 150, creme_fraiche 150, stock_chicken 1, puff_pastry 160, dijon 1, green_beans 150, milk 15, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Chop the chicken, slice the leek and mushrooms.|Fry the chicken in the oil for 5 min, add the leek and mushrooms and cook for 5 min.|Stir in the crème fraîche, mustard and stock cube with 100ml water. Simmer for 5 min and tip into a small pie dish.|Lay the pastry over the top, trim, brush with milk and bake for 25 min until golden.|Boil the green beans for 4 min and serve on the side.'),
R('lemon-couscous','Lemon & herb chicken couscous','🍋','chicken','Mediterranean',25,'Bright, fresh and light, with salty feta and soft courgette.',
'chicken_breast 300, couscous 150, courgette 1, cherry_tom 150, feta 60, lemon 1, oregano 1, stock_veg 1, olive_oil 2',
'Coat the chicken in oregano, half the lemon juice, 1 tbsp oil and seasoning.|Put the couscous in a bowl with the stock cube and 200ml boiling water. Cover for 5 min, then fluff up.|Fry the chicken for 6–7 min each side until cooked. Slice.|Fry the chopped courgette and halved tomatoes in the rest of the oil for 4 min.|Stir the veg and remaining lemon through the couscous and top with the chicken and crumbled feta.'),
R('chilli','Chilli con carne','🫘','beef','Mexican',45,'A proper smoky chilli with kidney beans, rice and soured cream.',
'beef_mince 250, onion 1, pepper 1, garlic 2, kidney 1, chopped_tom 1, cumin 1, smoked_paprika 1, chilli_flakes 0.5, stock_beef 1, tom_puree 1, rice 150, sour_cream 75, olive_oil 1',
'Chop the onion, pepper and garlic.|Fry the onion and pepper in the oil for 5 min, then add the garlic, spices and mince and brown for 5 min.|Stir in the purée, tomatoes, drained beans and stock cube with 150ml water. Simmer for 25 min.|Cook the rice for the last 12 min.|Serve the chilli over the rice with a dollop of soured cream.'),
R('burgers','Cheesy smash burgers & wedges','🍔','beef','American',35,'Crispy-edged burgers in brioche buns with paprika wedges.',
'beef_mince 300, buns 2, cheddar 40, red_onion 0.5, salad 40, potato 500, mayo 2, smoked_paprika 0.5, olive_oil 1',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into wedges, toss with the oil, paprika and salt and roast for 30 min.|Roll the mince into 2 balls and season.|Heat a heavy pan until very hot, add the balls and press flat with a spatula. Cook for 3 min, flip, top with cheese and cook for 2 min.|Toast the buns and spread with mayo.|Build the burgers with salad and sliced onion and serve with the wedges.'),
R('beef-broccoli','Beef & broccoli stir-fry','🥦','beef','Chinese',20,'Glossy, garlicky beef with tender broccoli in minutes.',
'beef_strips 300, broccoli 1, garlic 2, ginger 10, soy 3, honey 1, cornflour 1, rice 150, spring_onion 2, olive_oil 1',
'Cook the rice. Cut the broccoli into florets and blanch for 2 min.|Mix the soy, honey, cornflour and 4 tbsp water.|Stir-fry the beef in a very hot pan with the oil for 2 min. Add the garlic and ginger for 30 sec.|Add the broccoli and sauce and bubble for 1–2 min until glossy.|Serve on the rice topped with sliced spring onion.'),
R('cottage','Cottage pie','🥔','beef','British',60,'Savoury beef and veg under fluffy, cheesy mash.',
'beef_mince 300, onion 1, carrot 150, peas 80, potato 600, butter 25, milk 50, worcester 1, stock_beef 1, tom_puree 1, cheddar 30, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Peel and chop the potatoes and boil for 15 min.|Fry the chopped onion and carrot in the oil for 5 min, add the mince and brown.|Stir in the purée, Worcestershire sauce and stock cube with 250ml water. Simmer for 15 min, adding the peas at the end.|Mash the potatoes with the butter and milk.|Spoon the mince into a dish, top with mash and cheese and bake for 20 min until golden.'),
R('lasagne','Classic beef lasagne','🧀','beef','Italian',75,'Layers of rich ragù and silky white sauce. Worth the wait.',
'beef_mince 300, onion 1, carrot 100, garlic 2, chopped_tom 1, tom_puree 1, oregano 1, lasagne 125, milk 400, butter 30, flour 30, cheddar 60, olive_oil 1',
'Make a ragù: fry the chopped onion, carrot and garlic in oil for 5 min, brown the mince, add the purée, oregano and tomatoes and simmer for 20 min.|Make the white sauce: melt the butter, stir in the flour for 1 min, then whisk in the milk gradually and simmer until thick. Season.|Heat the oven to 190°C (170°C fan).|Layer ragù, lasagne sheets and white sauce in a dish, finishing with white sauce and cheese.|Bake for 35–40 min until golden and bubbling. Rest for 5 min before serving.'),
R('meatballs','Meatball marinara spaghetti','🧆','beef','Italian',35,'Juicy beef meatballs simmered in basil tomato sauce.',
'beef_mince 250, panko 30, onion 0.5, garlic 2, passata 500, spaghetti 180, basil 10, parmesan 20, oregano 1, olive_oil 1',
'Mix the mince, panko, finely grated onion, oregano and seasoning. Roll into 12 balls.|Brown the meatballs in the oil for 5 min.|Add the garlic for 1 min, then the passata. Simmer for 15 min.|Cook the spaghetti, drain and toss with the sauce.|Serve with torn basil and grated cheese.'),
R('tacos','Beef tacos with smashed avocado','🌮','beef','Mexican',25,'Spiced beef, zingy avocado and salsa in soft tortillas.',
'beef_mince 250, wraps 4, cumin 1, smoked_paprika 1, cheddar 40, salsa 100, salad 40, avocado 1, lime 1, olive_oil 1',
'Brown the mince in the oil, add the spices and a splash of water and cook for 8 min.|Mash the avocado with half the lime juice and salt.|Warm the tortillas and cut each in half if you like smaller tacos.|Fill with salad, beef, avocado, salsa and grated cheese. Serve with lime wedges.'),
R('korean-beef','Korean-style beef rice bowls','🍚','beef','Korean',25,'Sweet-savoury beef with crunchy veg and a runny fried egg.',
'beef_mince 250, garlic 2, ginger 10, soy 3, honey 1, sesame_oil 1, rice 150, cucumber 0.5, carrot 100, spring_onion 2, eggs 2, olive_oil 1',
'Cook the rice. Cut the cucumber and carrot into matchsticks.|Brown the mince in a hot pan until crispy, add the garlic and ginger for 1 min.|Stir in the soy, honey and sesame oil and cook for 2 min until sticky.|Fry the eggs in the oil.|Serve the beef on the rice with the veg, egg and sliced spring onion.'),
R('sausage-casserole','Smoky sausage & bean casserole','🌭','pork','British',45,'A cosy one-pot with butter beans and smoked paprika.',
'sausages 6, onion 1, garlic 2, smoked_paprika 1, chopped_tom 1, butter_beans 1, stock_veg 1, tom_puree 1, garlic_bread 1, olive_oil 1',
'Brown the sausages in the oil for 8 min, then remove.|Fry the sliced onion for 5 min, then the garlic and paprika for 1 min.|Add the purée, tomatoes, drained beans and stock cube with 150ml water.|Slice the sausages, return them to the pan and simmer for 20 min.|Bake the garlic bread following the pack and serve alongside.'),
R('bangers','Sausage & mash with onion gravy','🧅','pork','British',40,'Pub classic with buttery mash, peas and sticky onion gravy.',
'sausages 6, potato 600, onion 2, butter 25, milk 50, gravy 4, peas 120, olive_oil 1',
'Peel and chop the potatoes and boil for 15–20 min until tender.|Cook the sausages in the oil in a pan or under the grill for 15 min, turning.|Fry the sliced onions slowly in a little butter for 15 min until soft and golden.|Make the gravy with 300ml boiling water and the granules, add to the onions.|Mash the potatoes with the rest of the butter and milk. Cook the peas and serve everything together.'),
R('hoisin-pork','Hoisin pork noodles','🥢','pork','Chinese',20,'Crispy pork mince in sticky hoisin with cool cucumber.',
'pork_mince 250, hoisin 60, egg_noodles 150, pepper 1, spring_onion 3, garlic 2, ginger 10, soy 1, cucumber 0.5, olive_oil 1',
'Cook the noodles following the pack and drain.|Fry the mince in the oil over a high heat for 6 min until crispy.|Add the sliced pepper, garlic and ginger for 3 min.|Stir in the hoisin and soy, then toss through the noodles.|Serve topped with sliced spring onion and cucumber matchsticks.'),
R('carbonara','Bacon carbonara','🥓','pork','Italian',20,'Silky, cheesy spaghetti without any cream.',
'lardons 150, spaghetti 180, eggs 2, parmesan 40, garlic 1, olive_oil 1',
'Cook the spaghetti in salted boiling water.|Meanwhile fry the lardons in the oil until crisp, adding the crushed garlic for the last minute.|Beat the eggs with most of the cheese and lots of black pepper.|Drain the pasta, keeping a mug of the water. Off the heat, toss the pasta with the lardons, then the egg mix and a splash of water until creamy.|Serve straight away with the remaining cheese.'),
R('honey-mustard-pork','Honey mustard pork & crushed potatoes','🍯','pork','British',30,'Juicy pork steaks with a sweet, tangy creamy sauce.',
'pork_loin 2, baby_potato 400, green_beans 150, honey 1, dijon 2, creme_fraiche 100, olive_oil 1',
'Boil the potatoes for 15 min, adding the beans for the last 4 min. Drain.|Season the pork and fry in the oil for 4–5 min each side until cooked through. Rest.|Add the honey, mustard and crème fraîche to the pan with a splash of water and bubble for 1 min.|Lightly crush the potatoes with a fork and season.|Serve the pork with the potatoes, beans and sauce.'),
R('bacon-risotto','Bacon, leek & pea risotto','🥬','pork','Italian',40,'Creamy, comforting and full of sweet peas.',
'lardons 120, leek 1, risotto_rice 150, stock_chicken 1, parmesan 30, peas 80, butter 15, olive_oil 1',
'Dissolve the stock cube in 700ml boiling water.|Fry the lardons in the oil until golden, add the sliced leek and cook for 5 min.|Stir in the rice for 1 min, then add the stock a ladle at a time, stirring, for 18–20 min.|Add the peas for the last 3 min.|Stir in the butter and cheese, rest for 2 min and serve.'),
R('teriyaki-salmon','Teriyaki salmon & greens','🍣','fish','Japanese',25,'Sticky glazed salmon with rice and tender broccoli.',
'salmon 2, rice 150, broccoli 1, soy 3, honey 1.5, garlic 1, ginger 10, sesame_oil 1, spring_onion 2',
'Cook the rice. Mix the soy, honey, crushed garlic, grated ginger and sesame oil.|Heat the oven to 200°C (180°C fan). Put the salmon on a lined tray and spoon over half the sauce.|Bake for 12–15 min until just cooked.|Steam or boil the broccoli for 4 min.|Warm the rest of the sauce, then serve the salmon on the rice with broccoli, sauce and spring onion.'),
R('fish-chips','Crispy fish & chips with peas','🍟','fish','British',40,'Oven-baked, golden fish and chunky chips, no fryer needed.',
'cod 2, panko 50, eggs 1, flour 20, potato 600, peas 150, lemon 1, mayo 2, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into chips, toss in 1 tbsp oil and salt and roast for 35 min.|Dust the fish in flour, dip in beaten egg, then coat in panko. Drizzle with the rest of the oil.|Bake the fish for the last 15 min of the chips’ cooking time.|Cook the peas and lightly crush with a fork.|Mix the mayo with a squeeze of lemon and serve with lemon wedges.'),
R('prawn-spaghetti','Garlic prawn spaghetti','🦐','fish','Italian',20,'Lemon, garlic and a little chilli. Quick and impressive.',
'prawns 180, spaghetti 180, garlic 3, cherry_tom 150, chilli_flakes 0.5, lemon 1, parsley 10, olive_oil 2',
'Cook the spaghetti in salted boiling water.|Gently fry the sliced garlic and chilli in the oil for 1 min.|Add the halved tomatoes for 3 min, then the prawns for 2–3 min until pink.|Toss in the drained pasta with a splash of pasta water, the lemon zest and juice.|Serve scattered with chopped parsley.'),
R('paella','Prawn & chorizo paella-style rice','🥘','fish','Spanish',35,'Golden, smoky rice studded with prawns and peas.',
'prawns 180, chorizo 60, rice 150, onion 1, pepper 1, peas 80, smoked_paprika 1, turmeric 0.5, stock_chicken 1, lemon 1, olive_oil 1',
'Fry the sliced chorizo in the oil for 2 min, then add the chopped onion and pepper for 5 min.|Stir in the rice, paprika and turmeric.|Add the stock cube with 400ml boiling water. Cover and simmer for 12 min without stirring.|Scatter over the prawns and peas, cover and cook for 5 min more.|Serve with lemon wedges.'),
R('tuna-bake','Tuna & sweetcorn pasta bake','🥫','fish','British',35,'A cheap, cheesy store-cupboard favourite.',
'tuna 2, penne 180, sweetcorn 0.5, chopped_tom 1, onion 1, garlic 1, cheddar 60, oregano 1, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Cook the penne for 2 min less than the pack says.|Fry the chopped onion and garlic for 5 min, add the tomatoes and oregano and simmer for 5 min.|Stir in the drained tuna, sweetcorn and pasta.|Tip into a dish, top with cheese and bake for 15 min until bubbling.'),
R('pesto-salmon','Pesto salmon traybake','🐟','fish','Italian',30,'Everything roasted on one tray with a pesto crust.',
'salmon 2, baby_potato 400, cherry_tom 150, green_beans 150, pesto 40, lemon 1, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Halve the potatoes, toss in the oil and roast for 15 min.|Add the beans and tomatoes to the tray and push the potatoes aside.|Put the salmon on top, spread with pesto and roast for 12–15 min.|Squeeze over the lemon and serve.'),
R('fish-tacos','Crispy fish tacos','🐠','fish','Mexican',25,'Spiced fish, creamy avocado and a squeeze of lime.',
'cod 2, wraps 4, smoked_paprika 1, cumin 0.5, avocado 1, lime 1, salad 40, sour_cream 75, red_onion 0.5, olive_oil 1',
'Rub the fish with the spices, salt and oil.|Fry for 3–4 min each side until it flakes easily. Break into chunks.|Mash the avocado with half the lime juice. Thinly slice the onion.|Warm the wraps and fill with salad, fish, avocado, onion and soured cream.|Serve with lime wedges.'),
R('halloumi-couscous','Halloumi & roasted veg couscous','🍅','veggie','Mediterranean',35,'Squeaky golden halloumi on herby, lemony couscous.',
'halloumi 225, courgette 1, pepper 1, red_onion 1, cherry_tom 150, couscous 150, stock_veg 1, lemon 1, oregano 1, olive_oil 2',
'Heat the oven to 200°C (180°C fan). Chop the veg, toss with oil and oregano and roast for 25 min.|Put the couscous in a bowl with the stock cube and 200ml boiling water. Cover for 5 min.|Slice the halloumi and fry in a dry pan for 2 min each side.|Fluff the couscous with lemon juice and stir in the veg.|Top with the halloumi.'),
R('mushroom-risotto','Creamy mushroom risotto','🍄','veggie','Italian',40,'Earthy mushrooms, creamy rice and a handful of spinach.',
'mushroom 250, risotto_rice 150, onion 1, garlic 2, stock_veg 1, parmesan 30, butter 20, spinach 50, olive_oil 1',
'Dissolve the stock cube in 700ml boiling water.|Fry the sliced mushrooms in the oil until golden, then set aside half.|Add the chopped onion and garlic and cook for 4 min, then stir in the rice.|Add the stock a ladle at a time, stirring, for 18–20 min.|Stir in the spinach, butter, cheese and reserved mushrooms. Rest for 2 min and serve.'),
R('pesto-gnocchi','Pesto gnocchi with tomatoes','🌿','veggie','Italian',15,'Golden pan-fried gnocchi in a creamy pesto sauce.',
'gnocchi 500, pesto 60, cherry_tom 150, spinach 80, creme_fraiche 75, parmesan 20, olive_oil 1',
'Fry the gnocchi in the oil for 6–8 min until golden.|Add the halved tomatoes for 2 min.|Stir in the pesto, crème fraîche and spinach until wilted.|Serve with grated cheese.'),
R('veg-chilli','Sweet potato & black bean chilli','🍠','vegan','Mexican',40,'Hearty, smoky and naturally plant-based.',
'sweet_potato 400, black_beans 1, kidney 1, chopped_tom 1, onion 1, pepper 1, garlic 2, cumin 1, smoked_paprika 1, chilli_flakes 0.5, rice 150, stock_veg 1, lime 1, olive_oil 1',
'Peel and dice the sweet potato. Chop the onion, pepper and garlic.|Fry the onion and pepper in oil for 5 min, then add the garlic and spices for 1 min.|Add the sweet potato, tomatoes, drained beans and stock cube with 200ml water. Simmer for 25 min.|Cook the rice for the last 12 min.|Squeeze in the lime and serve over the rice.'),
R('chickpea-curry','Chickpea & spinach coconut curry','🥘','vegan','Indian',30,'A mild, creamy curry made almost entirely from the cupboard.',
'chickpeas 1, coconut 1, chopped_tom 1, onion 1, garlic 2, ginger 10, curry_paste 50, spinach 100, rice 150, olive_oil 1',
'Cook the rice. Chop the onion, garlic and ginger.|Fry the onion in the oil for 5 min, add the garlic, ginger and curry paste for 1 min.|Add the tomatoes, coconut milk and drained chickpeas and simmer for 15 min.|Stir in the spinach to wilt and season.|Serve over the rice. (Check the paste label if cooking fully vegan.)'),
R('dhal','Red lentil dhal','🍲','vegan','Indian',35,'Silky, warming lentils. Cheap and very comforting.',
'red_lentils 150, onion 1, garlic 2, ginger 10, curry_powder 2, cumin 1, turmeric 0.5, chopped_tom 1, coconut 0.5, spinach 80, rice 150, stock_veg 1, olive_oil 1',
'Fry the chopped onion in the oil for 5 min, add the garlic, ginger and spices for 1 min.|Add the rinsed lentils, tomatoes, coconut milk and stock cube with 500ml water.|Simmer for 20–25 min, stirring, until thick and soft.|Cook the rice.|Stir the spinach into the dhal and serve with the rice.'),
R('naan-pizza','Naan bread pizzas','🍕','veggie','Italian',15,'Speedy pizzas on naan bases with a side salad.',
'naan 2, passata 150, mozzarella 125, cherry_tom 100, basil 10, salad 60, oregano 1, olive_oil 1',
'Heat the oven to 220°C (200°C fan).|Mix the passata with the oregano and seasoning and spread over the naans.|Top with torn mozzarella and halved tomatoes, drizzle with oil.|Bake for 8–10 min until bubbling.|Scatter with basil and serve with the salad.'),
R('shakshuka','Shakshuka with feta','🍳','veggie','Middle Eastern',25,'Eggs gently baked in spiced tomatoes, with warm pitta.',
'eggs 4, chopped_tom 1, pepper 1, onion 1, garlic 2, cumin 1, smoked_paprika 1, feta 60, pitta 4, parsley 10, olive_oil 1',
'Fry the sliced onion and pepper in the oil for 6 min, add the garlic and spices for 1 min.|Add the tomatoes and simmer for 8 min until thick.|Make 4 dips in the sauce, crack in the eggs, cover and cook for 5–7 min until the whites are set.|Crumble over the feta and parsley.|Serve with toasted pitta.'),
R('mac-cheese','Crispy-top mac & cheese','🧀','veggie','American',35,'Proper cheesy sauce with a crunchy golden top and broccoli.',
'penne 200, milk 450, cheddar 120, butter 30, flour 30, dijon 1, panko 20, broccoli 1',
'Heat the grill. Cook the pasta, adding the broccoli florets for the last 3 min. Drain.|Melt the butter, stir in the flour for 1 min, then whisk in the milk and simmer until thick.|Stir in the mustard and most of the cheese until melted. Season.|Mix in the pasta and broccoli and tip into a dish.|Top with the rest of the cheese and panko and grill for 4–5 min until golden.'),
R('peanut-tofu','Peanut tofu noodles','🥜','vegan','Thai',25,'Crispy tofu and crunchy veg in a creamy peanut-lime sauce.',
'tofu 280, rice_noodles 150, pepper 1, carrot 100, spring_onion 3, peanut_butter 2, soy 3, lime 1, garlic 2, beansprouts 150, cornflour 2, olive_oil 1',
'Press the tofu dry, cube it and toss in cornflour. Fry in the oil for 8 min until crisp.|Soak or cook the noodles following the pack.|Whisk the peanut butter, soy, lime juice, crushed garlic and 4 tbsp hot water.|Stir-fry the sliced pepper, carrot and beansprouts for 3 min.|Toss in the noodles, sauce and tofu. Serve with spring onion.'),
R('veg-orzo','Roasted veg & feta orzo','🥗','veggie','Mediterranean',35,'Sweet roasted veg folded through tender orzo with salty feta.',
'orzo 160, courgette 1, pepper 1, red_onion 1, cherry_tom 150, feta 80, stock_veg 1, spinach 50, olive_oil 2',
'Heat the oven to 200°C (180°C fan). Chop the veg, toss with the oil and roast for 25 min.|Cook the orzo in 600ml water with the stock cube for 10 min until most of the liquid is absorbed.|Stir in the spinach and roasted veg.|Serve topped with crumbled feta.'),
R('quesadillas','Black bean & cheese quesadillas','🫓','veggie','Mexican',20,'Crispy, melty and ready in 20 minutes.',
'wraps 4, black_beans 1, cheddar 80, sweetcorn 0.5, pepper 1, spring_onion 2, salsa 100, sour_cream 75, cumin 1, olive_oil 1',
'Fry the chopped pepper in the oil for 4 min, add the drained beans, sweetcorn and cumin and roughly mash.|Spread the mix over 2 wraps, top with cheese and spring onion and cover with the other wraps.|Cook each quesadilla in a dry pan for 2–3 min each side until crisp and melted.|Cut into wedges and serve with salsa and soured cream.'),
R('halloumi-burger','Halloumi burgers & sweet potato fries','🍔','veggie','American',30,'Golden halloumi in brioche buns with smoky fries.',
'halloumi 225, buns 2, sweet_potato 500, salad 40, red_onion 0.5, mayo 2, smoked_paprika 1, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the sweet potatoes into fries, toss with oil and paprika and roast for 25 min.|Slice the halloumi into thick slabs and fry in a dry pan for 2 min each side.|Toast the buns and spread with mayo.|Fill with salad, halloumi and sliced onion. Serve with the fries.'),
R('stroganoff','Mushroom stroganoff','🍄','veggie','Eastern European',25,'Creamy paprika mushrooms over fluffy rice.',
'mushroom 300, onion 1, garlic 2, smoked_paprika 1, creme_fraiche 150, stock_veg 1, dijon 1, rice 150, parsley 10, olive_oil 1',
'Cook the rice.|Fry the sliced onion in the oil for 5 min, add the sliced mushrooms and cook for 6 min until golden.|Add the garlic and paprika for 1 min.|Stir in the crème fraîche, mustard and stock cube with 100ml water. Simmer for 3 min.|Serve over the rice with chopped parsley.'),

/* ---- Added Nov 2026 at your request: my own versions of dishes you like (not copied text) ---- */
R('chicken-spinach-curry','Chicken & spinach curry','🍛','chicken','Indian',25,'A quick, medium-spiced curry with spinach, rice and mango chutney. Based on a HelloFresh favourite.',
'chicken_thigh 280, onion 1, garlic 2, curry_paste 50, garam 1, passata 200, stock_chicken 0.5, spinach 100, rice 150, mango_chutney 30, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Dice the chicken and chop the onion and garlic.|Fry the chicken in the oil for 5 min until browned, add the onion and cook for 4 min more.|Stir in the garlic, curry paste and garam masala for 1 min.|Add the passata and the half stock cube dissolved in 100ml boiling water. Simmer for 10 min until the chicken is cooked and the sauce has thickened.|Stir in the spinach until wilted. Serve over the rice with a spoonful of mango chutney.'),
R('pork-lentil-curry','Pork & lentil curry','🍲','pork','Indian',25,'Rich, mild and filling: pork mince and red lentils in coconut sauce with kale and naan. Based on a HelloFresh recipe.',
'pork_mince 250, red_lentils 80, coconut 1, onion 1, garlic 2, ginger 10, curry_powder 2, garam 1, stock_veg 1, kale 80, naan 2, olive_oil 1',
'Chop the onion, garlic and ginger. Rinse the lentils.|Fry the pork mince in the oil over a high heat for 5 min until browned, then add the onion for 4 min.|Stir in the garlic, ginger, curry powder and garam masala for 1 min.|Add the lentils, coconut milk and the stock cube dissolved in 200ml boiling water. Simmer for 15 min, stirring now and then, until the lentils are soft.|Stir in the kale and cook for 3 min until tender. Season.|Warm the naans and serve alongside.'),
R('cauli-korma','Roasted cauli & broccoli korma','🥦','veggie','Indian',35,'Roasted florets and chickpeas in a creamy korma with cucumber-mint raita. Based on Waitrose’s Cauli Korma.',
'cauliflower 0.5, broccoli 0.5, cumin_seeds 1, onion 1, garlic 2, ginger 10, korma_sauce 225, chickpeas 1, yoghurt 100, cucumber 0.25, mint 5, naan 2, olive_oil 2',
'Heat the oven to 200°C (180°C fan). Cut the cauliflower and broccoli into florets, toss with 1 tbsp oil, the cumin seeds and salt, and roast for 20–25 min.|Fry the chopped onion in the rest of the oil for 5 min, then add the garlic and ginger for 1 min.|Stir in the korma sauce, the drained chickpeas and a splash of water. Simmer for 5 min.|Fold the roasted veg into the sauce.|Make a raita: grate the cucumber, squeeze out the water and mix with the yoghurt, chopped mint and a pinch of salt.|Warm the naans and serve with the korma and raita.'),
R('yellow-thai-curry','Yellow Thai-style veggie curry','🥥','veggie','Thai',35,'Roasted cauliflower, pepper and pak choi in a fragrant coconut sauce with jasmine rice. Based on a HelloFresh recipe.',
'cauliflower 0.5, pepper 1, pak_choi 1, garlic 1, yellow_curry 50, coconut 1, jasmine_rice 150, soy 1, lime 1, coriander 10, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Cut the cauliflower into small florets, toss with half the oil and roast for 20 min.|Rinse the rice and simmer it in 300ml water, covered, for 12 min. Rest off the heat.|Fry the sliced pepper in the rest of the oil for 3 min, then stir in the curry paste and crushed garlic for 1 min.|Pour in the coconut milk and 50ml water and simmer for 5 min.|Add the halved pak choi for 3 min, then the roasted cauliflower. Stir in the soy sauce and half the lime juice.|Serve over the rice with coriander and lime wedges. (Check the paste label if you need it vegetarian or vegan.)'),
R('korean-bbq-pork','Korean-style BBQ pork mince','🍚','pork','Korean',25,'Sticky, sweet and spicy gochujang pork over jasmine rice with green beans and crispy onions. Based on a HelloFresh recipe.',
'pork_mince 250, gochujang 30, bbq 2, soy 1, honey 0.5, garlic 2, green_beans 150, jasmine_rice 150, crispy_onions 20, spring_onion 2, sesame_seeds 1, olive_oil 1',
'Rinse the rice and simmer it in 300ml water, covered, for 12 min. Rest off the heat.|Trim the green beans and boil for 4–5 min, then drain.|Fry the pork mince in the oil over a high heat for 6–8 min until browned and crispy.|Add the crushed garlic for 1 min, then stir in the gochujang, BBQ sauce, soy, honey and 50ml water. Bubble for 2 min until sticky.|Serve the pork over the rice with the beans, crispy onions, sliced spring onion and sesame seeds.'),
R('coronation-curry','Coronation chicken curry','👑','chicken','British',25,'Mild, creamy and gently sweet with mango chutney, served with rice and green beans. Based on a HelloFresh recipe.',
'chicken_breast 280, onion 1, garlic 1, curry_powder 2, turmeric 0.5, stock_chicken 0.5, mango_chutney 40, sour_cream 100, green_beans 150, rice 150, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Fry the chopped onion in the oil for 4 min, then add the sliced chicken and cook for 6 min until golden.|Stir in the garlic, curry powder and turmeric for 1 min.|Add the half stock cube dissolved in 100ml boiling water and the mango chutney. Simmer for 3–4 min until the chicken is cooked through.|Take off the heat and stir in the soured cream. Season.|Boil the green beans for 4 min and serve everything together.'),
R('katsu-goodfood','Chicken katsu curry (Good Food style)','🍱','chicken','Japanese',45,'Golden shallow-fried panko chicken with a smooth, gently spiced curry sauce, rice and fresh cucumber. Written in the style of the BBC Good Food classic.',
'chicken_breast 300, flour 30, eggs 1, panko 60, onion 1, carrot 100, garlic 2, ginger 10, curry_powder 2, garam 0.5, stock_chicken 1, soy 1, honey 1, rice 150, cucumber 0.5, olive_oil 4',
'Make the sauce: fry the chopped onion and carrot in 1 tbsp oil for 8 min until soft, then add the garlic and ginger for 1 min.|Stir in the curry powder, garam masala and 1 tbsp of the flour for 1 min. Gradually stir in the stock cube with 400ml boiling water, the soy and honey. Simmer for 15 min, then blend until smooth.|Cook the rice.|Flatten the chicken to an even thickness. Dust in the rest of the flour, dip in beaten egg, then press into the panko.|Shallow-fry in the remaining oil for 4–5 min each side until golden and cooked through (or bake at 200°C / 180°C fan for 20 min).|Slice the chicken and serve on the rice with the sauce and thin slices of cucumber.'),
R('chicken-makhani','Chicken makhani (butter chicken)','🧈','chicken','Indian',45,'Charred, marinated chicken in a silky tomato, butter and cashew sauce. Based on Swasthi’s Recipes. Marinate ahead if you can.',
'chicken_thigh 350, yoghurt 60, chilli_powder 1, garam 1.5, ginger 10, garlic 3, lemon 0.5, butter 30, onion 1, passata 300, cashews 25, double_cream 50, honey 0.5, rice 150, coriander 10',
'Marinate: mix the chicken with the yoghurt, half the chilli powder, half the garam masala, half the grated ginger and garlic, the lemon juice and salt. Leave for at least 1 hour, or overnight in the fridge for the most tender result.|Soak the cashews in boiling water for 15 min.|Cook the chicken under a hot grill or in a hot pan for 10–12 min, turning, until charred and cooked through.|Melt the butter and cook the chopped onion for 5 min. Add the rest of the garlic, ginger and chilli powder for 1 min, then the passata. Simmer for 10 min.|Blend the sauce with the drained cashews until smooth. Return to the pan with the remaining garam masala, the honey and the cream.|Add the chicken and simmer for 5 min. Serve with rice and coriander.'),
R('goan-fish-curry','Goan fish curry','🐟','fish','Indian',30,'Flaky white fish in a tangy, gently spiced tomato and coconut sauce.',
'cod 2, onion 1, garlic 2, ginger 10, chopped_tom 1, coconut 1, turmeric 0.5, chilli_powder 1, ground_coriander 1, cumin 1, lime 1, rice 150, coriander 10, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Fry the chopped onion in the oil for 6 min until soft, then add the garlic and ginger for 1 min.|Stir in the turmeric, chilli powder, ground coriander and cumin for 1 min.|Add the chopped tomatoes and coconut milk and simmer for 10 min until slightly thickened. Squeeze in half the lime and season.|Cut the fish into large chunks, add to the sauce and simmer gently for 5–6 min until it flakes easily.|Serve over the rice with coriander and lime wedges.'),
R('vietnamese-pork','Vietnamese lemongrass pork noodle bowls','🥢','pork','Vietnamese',25,'Caramelised lemongrass pork over rice noodles with crunchy veg, herbs and peanuts.',
'pork_mince 250, lemongrass 1, garlic 2, fish_sauce 1.5, honey 1, rice_noodles 120, carrot 100, cucumber 0.5, salad 40, mint 5, coriander 5, lime 1, red_chilli 0.5, peanuts 15, olive_oil 1',
'Remove the tough outer layer of the lemongrass and finely chop the inside. Crush the garlic.|Cook the noodles following the pack, rinse in cold water and drain.|Fry the pork in the oil over a high heat for 6 min until browned. Add the lemongrass and garlic for 1 min.|Stir in 1 tbsp fish sauce and the honey and cook for 2 min until sticky and caramelised.|Mix the rest of the fish sauce with the lime juice, sliced chilli and 1 tbsp water to make a dressing.|Build bowls of noodles, salad, carrot and cucumber matchsticks and pork. Top with herbs, chopped peanuts and the dressing.'),
R('moghul-korma','Moghul chicken korma','🍛','chicken','Indian',40,'A rich, mild and nutty royal-style korma with cashews, cream and warm spices.',
'chicken_thigh 350, onion 1, garlic 2, ginger 10, cashews 30, yoghurt 75, double_cream 75, garam 1, turmeric 0.5, ground_coriander 1, cumin 0.5, butter 15, honey 0.5, rice 150, coriander 5',
'Soak the cashews in boiling water for 15 min. Cut the chicken into chunks.|Melt the butter and gently fry the chopped onion for 8 min until soft and golden. Add the garlic and ginger for 1 min.|Stir in the garam masala, turmeric, ground coriander and cumin for 1 min. Add the chicken and cook for 5 min.|Blend the cashews with the yoghurt and 100ml water until smooth. Stir into the pan and simmer gently for 15 min.|Cook the rice.|Stir in the cream and honey, season and simmer for 2 min. Serve with the rice and coriander. (Add a few crushed cardamom pods with the spices if you have them.)'),
R('murgh-kari','Murgh kari (home-style chicken curry)','🍗','chicken','Indian',45,'A classic everyday Indian chicken curry with onion, tomato, ginger and garlic.',
'chicken_thigh 400, onion 2, garlic 3, ginger 15, chopped_tom 1, red_chilli 1, turmeric 0.5, cumin 1, ground_coriander 1.5, garam 1, chilli_powder 0.5, rice 150, coriander 10, olive_oil 2',
'Finely chop the onions, grate the garlic and ginger and slice the chilli.|Fry the onions in the oil for 10–12 min, stirring, until deep golden. This builds the flavour.|Add the garlic, ginger and chilli for 1 min, then the turmeric, cumin, ground coriander and chilli powder for 1 min.|Add the chopped tomatoes and cook for 5 min until the oil starts to separate.|Add the chicken chunks and 150ml water. Cover and simmer for 20 min until the chicken is cooked and tender.|Cook the rice. Stir the garam masala into the curry, season and serve with coriander.'),
R('thai-beef','Thai-style beef & green beans','🥩','beef','Thai',25,'Gingery Thai-spiced beef mince with green beans, finished with sweet soy and lime. Based on a HelloFresh recipe.',
'beef_mince 250, red_onion 1, pepper 1, ginger 10, red_curry 15, stock_chicken 0.5, green_beans 100, ketjap 2, lime 1, coriander 10, jasmine_rice 150, olive_oil 1',
'Rinse the rice and simmer it in 300ml water, covered, for 12 min. Rest off the heat.|Brown the mince in the oil over a high heat for 5 min, then add the sliced onion and pepper for 4 min.|Stir in the grated ginger and curry paste for 1 min.|Add the half stock cube, the halved green beans and 100ml water. Simmer for 5–6 min until the beans are tender and the liquid has reduced by half.|Stir in the ketjap manis and half the lime juice.|Serve over the rice with coriander and lime wedges.'),
R('ginger-lime-stew','Ginger, lime & garlic chicken stew','🍋','chicken','Asian',25,'A fragrant coconut chicken stew with spinach and rice. Comforting but fresh. Based on a HelloFresh recipe.',
'chicken_breast 240, onion 1, garlic 3, ginger 15, coconut 1, stock_chicken 0.5, honey 0.5, spinach 100, lime 1, soy 0.5, rice 150, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Dice the chicken and fry in the oil for 5 min until golden, then add the chopped onion for 4 min.|Add the grated garlic and ginger for 1 min.|Pour in the coconut milk, the half stock cube, the honey and 75ml water. Simmer for 8–10 min until the chicken is cooked.|Stir in the spinach until wilted, then add the lime zest, half the juice and a little soy sauce to taste.|Serve in bowls over the rice.'),
R('sweet-potato-dal','Sweet potato coconut dal','🍠','vegan','Indian',35,'Creamy red lentils with tender sweet potato and spinach, with toasted wraps for dipping. Based on a HelloFresh recipe.',
'red_lentils 120, sweet_potato 300, coconut 1, onion 1, garlic 2, ginger 10, curry_powder 2, cumin 1, turmeric 0.5, stock_veg 1, spinach 50, wraps 2, coriander 10, olive_oil 1',
'Peel the sweet potato and cut into 1cm cubes. Chop the onion, garlic and ginger.|Fry the onion in the oil for 5 min, then add the garlic, ginger and spices for 1 min.|Add the sweet potato, rinsed lentils, coconut milk and the stock cube with 400ml boiling water.|Simmer for 20–25 min, stirring often, until the lentils are soft and the sweet potato is tender. Add a splash of water if it gets too thick.|Stir in the spinach and season.|Toast the wraps in a dry pan, cut into wedges and serve with the dal and coriander.'),
R('five-spice-pork-rice','Five spice honey garlic pork fried rice','🍳','pork','Chinese',25,'Sticky five-spice pork tossed with rice, sweetcorn and green beans, topped with peanuts. Based on a HelloFresh recipe.',
'pork_mince 250, rice 150, sweetcorn 0.5, green_beans 120, garlic 2, five_spice 1, honey 1, ketjap 1, soy 1, spring_onion 2, peanuts 20, olive_oil 1',
'Cook the rice, then spread it out on a tray to cool and dry (or use cold leftover rice).|Cut the green beans into short pieces and dry-fry in a hot pan for 4 min until charred. Set aside.|Fry the pork in the oil over a high heat for 6 min until browned. Add the garlic and five spice for 1 min.|Stir in the honey, ketjap manis and soy and bubble for 1 min.|Add the rice, sweetcorn and green beans and stir-fry for 3–4 min until piping hot.|Serve topped with sliced spring onion and chopped peanuts.'),
R('tomato-prawn-curry','Tomato, prawn & coconut curry','🦐','fish','Indian',35,'Sweet roasted-style cherry tomatoes and prawns in a fragrant coconut curry. Based on Waitrose’s recipe.',
'prawns 180, shallot 3, cherry_tom 200, madras_paste 40, coconut 1, lime 1, rice 150, coriander 10, crispy_onions 15, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Slice the shallots and fry in the oil for 6 min until soft and golden.|Add the curry paste for 1 min, then the halved cherry tomatoes and cook for 5 min until they start to collapse.|Pour in the coconut milk and simmer for 10 min. (The sauce can be made ahead and chilled or frozen at this point.)|Add the prawns and cook for 3 min until pink. Squeeze in half the lime and season.|Serve with the rice, coriander, crispy onions and lime wedges.'),
R('thai-pork-bowl','Thai-style pork rice bowl','🍚','pork','Thai',25,'Larb-inspired pork mince with shallot, chilli and sweet soy over rice with green beans. Based on a HelloFresh recipe.',
'pork_mince 250, shallot 2, garlic 2, red_chilli 1, ketjap 2, soy 1, green_beans 150, rice 150, lime 0.5, coriander 10, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Trim the green beans and boil for 4 min, then drain.|Finely chop the shallots, garlic and chilli.|Fry the pork in the oil over a high heat for 6 min until browned. Add the shallot, garlic and chilli for 2 min.|Stir in the ketjap manis and soy and cook for 1 min until glossy. Add a squeeze of lime.|Serve the pork over the rice with the green beans and coriander.'),
R('superfast-pork-noodles','Superfast Asian-spiced pork noodles','🍜','pork','Asian',15,'Sweet and spicy pork mince tossed with egg noodles and green pepper. Ready in 15 minutes. Based on a HelloFresh recipe.',
'egg_noodles 150, pork_mince 240, pepper 1, garlic 1, chilli_flakes 0.5, ground_coriander 1, ketjap 2, rice_vinegar 1, honey 0.5, spring_onion 2, coriander 10, lime 1, olive_oil 1',
'Cook the noodles following the pack, then drain.|Fry the pork in the oil over a high heat for 5 min until browned, breaking it up.|Add the sliced pepper and crushed garlic for 3 min, then the chilli flakes and ground coriander for 30 sec.|Stir in the ketjap manis, rice vinegar, honey and a splash of water.|Toss through the noodles with half the lime juice.|Serve topped with sliced spring onion, coriander and lime wedges.'),
R('cha-ca-salmon','Chả cá Thăng Long inspired salmon','🐟','fish','Vietnamese',20,'Turmeric-marinated salmon on rice noodles with heaps of dill, herbs, peanuts and a zingy dressing. Based on a HelloFresh recipe.',
'salmon 2, turmeric 1, garlic 1, ginger 10, rice_noodles 120, dill 15, spring_onion 3, coriander 5, mint 5, cucumber 0.5, red_chilli 0.5, peanuts 20, lime 1, fish_sauce 1, honey 0.5, olive_oil 1',
'Mix the turmeric, grated garlic and ginger with half the oil and a pinch of salt. Rub over the salmon.|Cook the noodles following the pack, rinse in cold water and drain.|Mix the lime juice, fish sauce, honey, sliced chilli and 1 tbsp water to make the dressing.|Fry the salmon in the rest of the oil for 3–4 min each side until just cooked. Add the spring onions (cut into lengths) and most of the dill for the last minute.|Toss the noodles with the cucumber, herbs and half the dressing.|Top with the salmon and dill, the remaining dressing and chopped peanuts.'),
R('miso-pork-udon','Ginger miso pork udon stir-fry','🥢','pork','Japanese',15,'Thick udon noodles with savoury ginger-miso pork, mushrooms and crunchy veg. Based on a HelloFresh recipe.',
'pork_mince 240, mushroom 120, ginger 15, stir_fry_veg 150, miso 25, ketjap 1, soy 1, honey 0.5, udon 300, spring_onion 2, olive_oil 1',
'Fry the pork and sliced mushrooms in the oil over a high heat for 6 min until browned.|Add the grated ginger for 1 min, then the stir-fry veg for 2 min.|Mix the miso, ketjap manis, soy, honey and 3 tbsp water until smooth, then stir into the pan.|Add the udon noodles and toss for 2 min until hot and coated.|Serve topped with sliced spring onion.'),
R('spiced-chicken-udon','Speedy spiced chicken udon','🍜','chicken','Indonesian',20,'Indonesian-spiced chicken, peppers and crunchy veg with chewy udon and salted peanuts. Based on a HelloFresh recipe.',
'chicken_breast 260, udon 300, pepper 1, stir_fry_veg 150, garlic 1, curry_powder 1, chilli_flakes 0.5, ground_coriander 1, ketjap 2, soy 1, peanuts 20, olive_oil 1',
'Dice the chicken and slice the pepper.|Fry the chicken in the oil over a high heat for 6–7 min until golden and cooked through.|Add the pepper and stir-fry veg for 3 min, then the garlic and spices for 30 sec.|Stir in the ketjap manis, soy and 2 tbsp water, then add the udon and toss for 2 min until hot.|Serve topped with chopped peanuts.'),
R('bang-bang-chicken','Bang bang chicken noodles','🥜','chicken','Chinese',25,'Tender shredded chicken and crunchy cucumber with a creamy, spicy peanut sauce.',
'chicken_breast 280, rice_noodles 120, cucumber 0.5, carrot 100, spring_onion 3, peanut_butter 3, soy 2, sweet_chilli 2, rice_vinegar 1, sesame_oil 1, lime 0.5, peanuts 15, coriander 5',
'Put the chicken in a pan of cold water, bring to a gentle simmer and poach for 12–15 min until cooked through. Leave to cool slightly, then shred.|Cook the noodles following the pack, rinse in cold water and drain.|Whisk the peanut butter, soy, sweet chilli, rice vinegar, sesame oil, lime juice and 2–3 tbsp hot water until smooth.|Cut the cucumber and carrot into matchsticks and slice the spring onions.|Pile the noodles, veg and chicken into bowls, spoon over the sauce and scatter with peanuts and coriander.'),
R('sweet-chilli-noodles','Sweet chilli chicken noodles','🌶️','chicken','Asian',20,'Sticky sweet chilli chicken with Chinese leaf, egg noodles and salted peanuts. Based on a HelloFresh recipe.',
'chicken_breast 260, egg_noodles 150, chinese_leaf 0.5, garlic 1, spring_onion 2, sweet_chilli 4, soy 1, lime 0.5, peanuts 20, olive_oil 1',
'Cook the noodles following the pack, then drain.|Dice the chicken and fry in the oil for 6–7 min until golden and cooked through.|Add the shredded Chinese leaf and crushed garlic and stir-fry for 2–3 min.|Stir in the sweet chilli sauce, soy and a splash of water, then toss in the noodles.|Squeeze over the lime and serve topped with spring onion and chopped peanuts.'),
R('chicken-laksa','Fragrant chicken laksa','🍲','chicken','Malaysian',30,'A rich, spicy coconut noodle soup with chicken, pepper and a little peanut butter. Based on a HelloFresh recipe.',
'chicken_thigh 280, red_curry 50, coconut 1, peanut_butter 1, stock_chicken 1, egg_noodles 150, pepper 1, garlic 2, red_chilli 0.5, beansprouts 100, lime 1, coriander 10, olive_oil 1',
'Slice the chicken and pepper and chop the garlic.|Fry the garlic, chilli and curry paste in half the oil for 1 min. Add the coconut milk, the stock cube with 300ml boiling water and the peanut butter. Simmer for 10 min.|Meanwhile fry the chicken in the rest of the oil for 6–7 min until golden and cooked through. Add the pepper for the last 3 min.|Cook the noodles following the pack and drain.|Add the chicken and pepper to the broth with half the lime juice.|Divide the noodles between bowls, ladle over the laksa and top with beansprouts, coriander and lime wedges.'),
R('sweet-sour-chicken','Sweet & sour style chicken','🍍','chicken','Chinese',25,'Tangy-sweet chicken with peppers, red onion and pineapple over egg noodles. Based on a HelloFresh recipe.',
'chicken_thigh 300, egg_noodles 150, pepper 1, red_onion 1, pineapple 0.5, garlic 1, ketjap 1, rice_vinegar 2, tom_puree 1, honey 1, cornflour 1, olive_oil 1',
'Cook the noodles following the pack, then drain.|Mix the ketjap manis, rice vinegar, tomato purée, honey, cornflour and 4 tbsp of the pineapple juice from the tin.|Dice the chicken and fry in the oil for 6–7 min until golden and cooked through.|Add the chopped pepper and red onion for 4 min, then the garlic for 30 sec.|Pour in the sauce and the pineapple chunks and bubble for 1–2 min until glossy.|Serve over the noodles.'),
R('shanghai-hoisin-chicken','Shanghai-style hoisin chicken stir-fry','🥡','chicken','Chinese',30,'Five-spice chicken thigh in glossy hoisin with green beans, pepper and egg noodles. Based on a HelloFresh recipe.',
'chicken_thigh 300, five_spice 1, egg_noodles 150, hoisin 60, soy 1, green_beans 100, pepper 1, garlic 2, ginger 10, spring_onion 2, olive_oil 1',
'Dice the chicken and toss with the five spice and a pinch of salt.|Cook the noodles following the pack, then drain.|Stir-fry the chicken in the oil over a high heat for 8–10 min until browned and cooked through.|Add the halved green beans and sliced pepper for 4 min, then the garlic and ginger for 1 min.|Stir in the hoisin, soy and a splash of water, then toss through the noodles.|Serve topped with sliced spring onion.'),
R('black-bean-pork','Black bean pork mince noodles','🍜','pork','Chinese',20,'Savoury black bean pork with pepper and green beans tossed through egg noodles. Based on a HelloFresh recipe.',
'pork_mince 240, egg_noodles 150, pepper 1, green_beans 80, garlic 2, spring_onion 1, black_bean_sauce 150, olive_oil 1',
'Cook the noodles following the pack, drain and rinse in cold water.|Fry the pork in the oil over a high heat for 5–6 min until browned, then remove to a plate.|Stir-fry the sliced pepper and halved green beans in the same pan for 4 min, then add the garlic for 1 min.|Return the pork, add the black bean sauce and a splash of water, then toss in the noodles for 2 min until hot.|Serve topped with sliced spring onion.'),
R('soba-salad','Chilli soba noodle salad with peas & broad beans','🥗','veggie','Japanese',20,'Nutty buckwheat noodles with sweet peas, broad beans, herbs and a chilli-lime dressing. Lovely warm or cold.',
'soba 150, peas 100, broad_beans 100, cucumber 0.5, spring_onion 3, red_chilli 1, ginger 10, lime 1, soy 2, honey 1, sesame_oil 1, mint 5, coriander 5, sesame_seeds 1',
'Cook the soba following the pack, adding the peas and broad beans for the last 3 min. Drain and rinse in cold water.|Pop the broad beans out of their grey skins if you like (they’re brighter and sweeter).|Whisk the lime juice, soy, honey, sesame oil, grated ginger and half the sliced chilli to make the dressing.|Toss the noodles, peas and beans with the cucumber, spring onion, herbs and dressing.|Serve scattered with the rest of the chilli and the sesame seeds. (Add flaked salmon or prawns for extra protein.)'),
R('pea-pistachio-pasta','Pea, broad bean & pistachio pasta','🌱','veggie','Italian',25,'Linguine in a bright green pea and pistachio pesto with broad beans, lemon and mint.',
'linguine 180, peas 120, broad_beans 120, pistachios 40, parmesan 30, lemon 1, garlic 1, mint 10, basil 10, olive_oil 3',
'Cook the linguine in salted boiling water, adding the peas and broad beans for the last 3 min. Keep a mug of the pasta water, then drain.|Blend a third of the peas with most of the pistachios, the garlic, mint, basil, half the cheese, the lemon zest and juice and the oil until fairly smooth. Season.|Toss the pasta, peas and beans with the pesto, adding splashes of pasta water until silky.|Serve topped with the rest of the cheese and roughly chopped pistachios.'),

/* ---- Pasta batch, added Nov 2026 ---- */
R('spicy-creamy-chicken-pasta','Spicy creamy chicken pasta','🌶️','chicken','Italian',20,'Golden chicken and tomatoes in a smoky, chilli-spiked creamy sauce with penne. Based on a HelloFresh recipe.',
'chicken_breast 260, penne 180, cream_cheese 90, chilli_flakes 0.5, smoked_paprika 1, garlic 2, cherry_tom 150, spinach 60, parmesan 20, stock_chicken 0.5, olive_oil 1',
'Cook the penne in salted boiling water. Keep a mug of the pasta water, then drain.|Dice the chicken and fry in the oil for 6–7 min until golden and cooked through.|Add the halved tomatoes, garlic, paprika and chilli flakes for 2 min.|Stir in the soft cheese, the half stock cube and 100ml pasta water until creamy.|Add the spinach to wilt, then toss through the pasta with half the cheese.|Serve topped with the rest of the cheese.'),
R('chorizo-sweetcorn-pasta','Speedy creamy chorizo & sweetcorn pasta','🌽','pork','Spanish',15,'Smoky chorizo and sweet corn in a quick creamy sauce. Dinner in 15 minutes. Based on a HelloFresh recipe.',
'chorizo 90, penne 180, sweetcorn 0.5, cream_cheese 90, garlic 1, spring_onion 2, smoked_paprika 0.5, cheddar 30',
'Cook the penne in salted boiling water. Keep a mug of the pasta water, then drain.|Dice the chorizo and fry in a dry pan for 3 min until it releases its oil.|Add the garlic, paprika and drained sweetcorn for 2 min.|Stir in the soft cheese and a splash of pasta water until silky.|Toss with the pasta, adding more water if needed.|Serve topped with grated cheddar and sliced spring onion.'),
R('bbq-beef-rigatoni','BBQ beef ragù rigatoni','🍝','beef','Italian-American',30,'A sweet, smoky beef ragù with BBQ sauce and paprika, tossed with rigatoni. Based on a HelloFresh recipe.',
'beef_mince 250, rigatoni 180, onion 1, garlic 2, chopped_tom 1, bbq 2, smoked_paprika 1, worcester 1, stock_beef 1, cheddar 30, olive_oil 1',
'Fry the chopped onion in the oil for 5 min, then add the mince and brown for 5 min.|Stir in the garlic and paprika for 1 min.|Add the chopped tomatoes, BBQ sauce, Worcestershire sauce and the stock cube with 100ml water. Simmer for 12 min.|Meanwhile cook the rigatoni, keeping a splash of pasta water.|Toss the pasta through the ragù with a little pasta water.|Serve topped with grated cheddar.'),
R('porky-linguine','Porky linguine','🍝','pork','Italian',20,'Herby pork mince in a rich tomato sauce with spinach and cheese, like a speedy bolognese. Based on a HelloFresh recipe.',
'pork_mince 240, linguine 180, onion 0.5, garlic 1, oregano 1, worcester 1, chopped_tom 1, tom_puree 1, stock_beef 0.5, honey 0.25, spinach 80, parmesan 30, olive_oil 1',
'Cook the linguine in salted boiling water, then drain.|Brown the pork in the oil for 5 min, draining off any excess fat. Add the chopped onion and garlic for 3 min.|Stir in the oregano and Worcestershire sauce, then the tomatoes, purée, the half stock cube, honey and 100ml water. Simmer for 8 min.|Stir in the spinach until wilted and season.|Toss the linguine through the sauce with half the cheese.|Serve topped with the rest of the cheese.'),
R('cajun-ravioli','Spinach & ricotta ravioli in spicy Cajun sauce','🥟','veggie','Cajun-Italian',20,'Fresh ravioli in a creamy, Cajun-spiced tomato sauce with peppers and red onion. Based on a HelloFresh recipe.',
'ravioli 400, cajun 1.5, passata 200, creme_fraiche 75, red_onion 1, pepper 1, garlic 1, spinach 50, parmesan 20, olive_oil 1',
'Fry the sliced red onion and pepper in the oil for 5 min until soft.|Add the garlic and Cajun seasoning for 1 min.|Stir in the passata and simmer for 5 min, then stir in the crème fraîche.|Meanwhile cook the ravioli in boiling water for 2–3 min (follow the pack) and drain.|Stir the spinach into the sauce to wilt, then gently fold in the ravioli.|Serve topped with grated cheese.'),
R('green-mac','Green mac ’n’ cheese','🥦','veggie','British',40,'Cheesy macaroni with pesto, lemon, peas and asparagus under a crispy top. Based on Waitrose’s recipe.',
'macaroni 180, milk 450, butter 30, flour 30, cheddar 100, pesto 30, lemon 0.5, peas 100, asparagus 125, panko 20',
'Heat the oven to 200°C (180°C fan). Cook the macaroni for 2 min less than the pack says, adding the peas and chopped asparagus for the last 3 min. Drain.|Melt the butter, stir in the flour for 1 min, then whisk in the milk gradually and simmer until thick.|Take off the heat and stir in most of the cheese, the pesto and the lemon zest. Season.|Stir in the pasta and veg and tip into a dish.|Top with the rest of the cheese and the panko and bake for 15–20 min until golden.'),
R('leek-sausage-pasta','Mustardy leek & sausage pasta','🌭','pork','British',30,'Golden sausage pieces and soft leeks in a creamy mustard sauce. Based on a Waitrose recipe.',
'sausages 4, penne 180, leek 1, garlic 1, dijon 2, creme_fraiche 150, stock_chicken 0.5, parmesan 20, olive_oil 1',
'Squeeze the sausages out of their skins into small balls and fry in the oil for 8 min until golden.|Add the sliced leek and cook for 6 min until soft, then the garlic for 1 min.|Meanwhile cook the penne, keeping a mug of the pasta water.|Stir the mustard, crème fraîche, the half stock cube and a splash of pasta water into the pan.|Toss in the pasta, loosening with more water if needed.|Serve topped with grated cheese.'),
R('lamb-mushroom-ragu','Easy lamb & mushroom ragù','🍝','lamb','Italian',30,'A rich, herby lamb and mushroom sauce with spaghetti. Based on a HelloFresh recipe.',
'lamb_mince 250, mushroom 150, spaghetti 180, onion 1, garlic 2, chopped_tom 1, tom_puree 1, oregano 1, stock_beef 1, parmesan 20, olive_oil 1',
'Brown the lamb in the oil for 5 min, then spoon off excess fat.|Add the chopped onion and sliced mushrooms and cook for 6 min.|Stir in the garlic, purée and oregano for 1 min.|Add the tomatoes and stock cube with 100ml water and simmer for 12 min.|Cook the spaghetti and toss it through the sauce.|Serve topped with grated cheese.'),
R('plant-lasagne','Plant-packed lasagne','🥬','veggie','Italian',90,'Lentil and mushroom ragù layered with squash, spinach and white sauce. A simplified, 2-person take on Waitrose’s 30-plant lasagne.',
'lasagne 125, red_lentils 60, mushroom 150, onion 1, carrot 100, garlic 2, courgette 0.5, pepper 1, chopped_tom 1, tom_puree 1, stock_veg 1, oregano 1, butternut 0.25, spinach 80, basil 10, milk 400, butter 30, flour 30, cheddar 50, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Peel and thinly slice the squash and roast with a little oil for 15 min.|Fry the chopped onion, carrot, courgette, pepper and mushrooms in the oil for 8 min. Add the garlic, purée and oregano for 1 min.|Add the rinsed lentils, tomatoes and stock cube with 300ml water. Simmer for 20 min until the lentils are soft.|Make a white sauce: melt the butter, stir in the flour, then whisk in the milk and simmer until thick. Season.|Layer ragù, spinach, squash, lasagne sheets and white sauce in a small dish, finishing with white sauce and cheese.|Bake for 35–40 min until golden. Rest for 5 min and scatter with basil.'),
R('herby-pork-ragu','Herby pork ragù','🌿','pork','Italian',30,'Pork mince, carrot and plenty of herbs simmered in tomatoes with rigatoni. Based on a HelloFresh recipe.',
'pork_mince 250, rigatoni 180, onion 1, carrot 80, garlic 2, chopped_tom 1, oregano 1, basil 10, stock_chicken 0.5, parmesan 20, olive_oil 1',
'Fry the pork in the oil for 5 min until browned. Add the finely chopped onion and grated carrot for 5 min.|Stir in the garlic and oregano for 1 min.|Add the tomatoes and the half stock cube with 100ml water. Simmer for 12 min.|Cook the rigatoni and toss it through the ragù with a splash of pasta water.|Stir in torn basil and serve with grated cheese.'),
R('bacon-arrabbiata','Bacon penne all’arrabbiata','🥓','pork','Italian',20,'Fiery garlic and chilli tomato sauce with crispy bacon and penne. Based on a HelloFresh recipe.',
'lardons 120, penne 180, chopped_tom 1, tom_puree 1, garlic 2, chilli_flakes 1, honey 0.25, basil 10, parmesan 20, olive_oil 1',
'Cook the penne in salted boiling water, then drain.|Fry the lardons in the oil until crisp.|Add the sliced garlic and chilli flakes for 1 min.|Stir in the tomatoes, purée and honey and simmer for 8 min.|Toss the penne through the sauce with torn basil.|Serve with grated cheese.'),
R('penne-rustica','Penne alla rustica','🫑','pork','Italian',30,'A rustic tomato sauce with sausage, peppers, courgette and red onion. Written from the dish name (the Simply Cook kit version wasn’t available).',
'sausages 4, penne 180, pepper 1, red_onion 1, courgette 0.5, chopped_tom 1, garlic 2, oregano 1, chilli_flakes 0.25, parmesan 20, olive_oil 1',
'Squeeze the sausages out of their skins into small pieces and fry in the oil for 6 min until browned.|Add the chopped pepper, red onion and courgette and cook for 6 min.|Stir in the garlic, oregano and chilli for 1 min, then the tomatoes. Simmer for 10 min.|Meanwhile cook the penne, keeping a splash of pasta water.|Toss together and serve with grated cheese.'),
R('tuna-pepper-pasta-salad','Tuna & roasted pepper pasta salad','🥗','fish','Mediterranean',20,'A zingy pasta salad with tuna, sweet roasted peppers, tomatoes and basil. Great for lunch the next day too. Based on a Waitrose recipe.',
'penne 160, tuna 2, roasted_peppers 120, cherry_tom 150, red_onion 0.5, basil 10, lemon 1, dijon 1, olive_oil 2',
'Cook the penne, then drain and rinse in cold water.|Whisk the oil, lemon juice, mustard and seasoning to make a dressing.|Slice the roasted peppers, halve the tomatoes and finely slice the red onion.|Toss the pasta with the dressing, veg and flaked tuna.|Scatter with torn basil and serve.'),
R('chorizo-piquante-salad','Chorizo & sweet piquanté pepper pasta salad','🌶️','pork','Spanish',20,'Warm crispy chorizo, sweet piquanté peppers, feta and tomatoes tossed with pasta. Based on a Waitrose recipe.',
'penne 160, chorizo 80, piquante 80, cherry_tom 100, feta 50, salad 40, red_onion 0.5, basil 10, lemon 0.5, olive_oil 1',
'Cook the penne, then drain and rinse in cold water.|Slice the chorizo and fry in a dry pan for 3–4 min until crisp. Keep the red oil.|Mix the chorizo oil with the olive oil and lemon juice to make a dressing.|Toss the pasta with the dressing, sliced piquanté peppers, halved tomatoes, onion and salad leaves.|Top with the chorizo, crumbled feta and basil.'),
R('miso-beans-silk','Miso green beans with silk handkerchiefs','🫘','veggie','Italian-Japanese',35,'Silky squares of fresh pasta with green beans in a savoury miso butter. Written from the dish name (Waitrose’s full recipe wasn’t available).',
'fresh_lasagne 200, green_beans 200, miso 30, butter 30, garlic 1, lemon 0.5, chilli_flakes 0.25, parmesan 20, sesame_seeds 1',
'Cut each lasagne sheet into 2–3 large squares (the "silk handkerchiefs").|Boil the green beans for 4 min, then lift out. Cook the pasta squares in the same water for 2–3 min. Keep a mug of the water.|Melt the butter in a large pan, add the garlic for 1 min, then whisk in the miso and 4 tbsp pasta water.|Add the beans and pasta and toss gently until glossy, adding more water if needed.|Finish with lemon juice and chilli flakes. Serve with grated cheese and sesame seeds.'),
R('veggie-bolognese-bake','Veggie bolognese pasta bake','🧀','veggie','Italian',45,'A hearty lentil and mushroom bolognese baked with penne under melted cheese. In the style of Jamie Oliver’s veggie bolognese.',
'penne 180, green_lentils 1, mushroom 150, onion 1, carrot 100, garlic 2, chopped_tom 1, tom_puree 1, oregano 1, stock_veg 1, spinach 50, cheddar 50, mozzarella 60, olive_oil 1',
'Heat the oven to 200°C (180°C fan).|Fry the chopped onion, grated carrot and chopped mushrooms in the oil for 8 min. Add the garlic, purée and oregano for 1 min.|Add the drained lentils, tomatoes and stock cube with 150ml water. Simmer for 10 min, then stir in the spinach.|Cook the penne for 2 min less than the pack says and drain.|Mix the pasta with the sauce, tip into a dish and top with both cheeses.|Bake for 15–20 min until golden and bubbling.'),
R('spinach-pesto-pasta','Spinach pesto pasta','🌿','veggie','Italian',20,'A bright, quick spinach and basil pesto stirred through spaghetti. Based on a Waitrose recipe.',
'spaghetti 180, spinach 120, basil 15, cashews 25, parmesan 30, garlic 1, lemon 0.5, olive_oil 3',
'Cook the spaghetti in salted boiling water. Keep a mug of the pasta water.|Blanch the spinach in a little boiling water for 30 sec, then squeeze dry.|Blend the spinach, basil, nuts, most of the cheese, garlic, lemon juice and oil to a smooth pesto. Season.|Toss the drained pasta with the pesto and splashes of pasta water until silky.|Serve with the rest of the cheese.'),
R('mushroom-pancetta-linguine','Mushroom & pancetta linguine','🍄','pork','Italian',20,'Crispy pancetta and golden mushrooms in a light, creamy sauce. Based on a HelloFresh recipe.',
'pancetta 130, mushroom 200, linguine 180, garlic 2, creme_fraiche 100, stock_chicken 0.5, parmesan 20, parsley 10, olive_oil 1',
'Cook the linguine in salted boiling water. Keep a mug of the pasta water.|Fry the pancetta in the oil for 4 min until crisp, then add the sliced mushrooms and cook for 6 min until golden.|Add the garlic for 1 min.|Stir in the crème fraîche, the half stock cube and a splash of pasta water.|Toss through the linguine with half the cheese.|Serve with chopped parsley and the rest of the cheese.'),
R('sausage-meatball-spaghetti','Sausage meatballs & spaghetti','🧆','pork','Italian',30,'Quick meatballs squeezed from sausages, simmered in herby tomato sauce. Based on a HelloFresh recipe.',
'sausages 4, spaghetti 180, chopped_tom 1, tom_puree 1, onion 0.5, garlic 2, oregano 1, basil 10, parmesan 20, olive_oil 1',
'Squeeze the sausage meat out of the skins and roll into 12 small balls.|Brown the meatballs in the oil for 6–8 min, turning, then remove.|Fry the chopped onion for 4 min, then the garlic and oregano for 1 min.|Add the tomatoes and purée, return the meatballs and simmer for 10 min until cooked through.|Cook the spaghetti and toss it through the sauce.|Serve with torn basil and grated cheese.'),
R('mexican-beef-bake','Mexican-style beef pasta bake','🌮','beef','Mexican',35,'Spiced beef, peppers and beans baked with penne under a cheesy top, with soured cream. Based on a HelloFresh recipe.',
'beef_mince 250, penne 180, onion 1, pepper 1, black_beans 0.5, chopped_tom 1, cumin 1, smoked_paprika 1, chilli_powder 0.5, cheddar 60, sour_cream 75, spring_onion 2, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Cook the penne for 2 min less than the pack says and drain.|Brown the mince in the oil, add the chopped onion and pepper and cook for 5 min.|Stir in the spices for 1 min, then the tomatoes and drained beans. Simmer for 8 min.|Mix in the pasta, tip into a dish and cover with cheese.|Bake for 12–15 min until golden.|Serve with soured cream and sliced spring onion.'),
R('chorizo-crusted-penne','Chorizo-crusted baked penne','🥖','pork','Italian',35,'Tomato and mozzarella baked penne under a crunchy chorizo breadcrumb crust. Based on a HelloFresh recipe.',
'penne 180, chorizo 80, panko 30, chopped_tom 1, red_onion 1, garlic 2, oregano 1, mozzarella 125, parmesan 20, olive_oil 1',
'Heat the oven to 220°C (200°C fan). Cook the penne for 2 min less than the pack says and drain.|Finely chop the chorizo and fry for 3 min until crisp. Stir in the panko and cheese and set aside.|In the same pan fry the chopped onion for 5 min, add the garlic and oregano, then the tomatoes. Simmer for 8 min.|Mix the pasta with the sauce and torn mozzarella and tip into a dish.|Scatter over the chorizo crumbs and bake for 10–12 min until crisp and bubbling.'),
R('blue-cheese-cauli-mac','Blue cheese cauliflower mac & cheese','🧀','veggie','British',35,'Tangy Stilton and cheddar sauce with macaroni and tender cauliflower, under a crunchy top. Based on a HelloFresh recipe.',
'macaroni 180, cauliflower 0.5, blue_cheese 70, cheddar 40, milk 400, butter 30, flour 30, dijon 1, panko 20',
'Heat the grill. Cook the macaroni, adding small cauliflower florets for the last 5 min. Drain.|Melt the butter, stir in the flour for 1 min, then whisk in the milk and simmer until thick.|Stir in the mustard, crumbled blue cheese and most of the cheddar until melted. Season.|Mix in the pasta and cauliflower and tip into a dish.|Top with the rest of the cheddar and panko and grill for 4–5 min until golden.'),
R('rosemary-lamb-rigatoni','Rosemary lamb & mushroom rigatoni','🌿','lamb','Italian',30,'Lamb mince, mushrooms and rosemary in a rich tomato sauce finished with a little crème fraîche. Based on a HelloFresh recipe.',
'lamb_mince 250, rigatoni 180, mushroom 120, rosemary 3, onion 1, garlic 2, chopped_tom 1, tom_puree 1, stock_beef 0.5, creme_fraiche 50, parmesan 20, olive_oil 1',
'Brown the lamb in the oil for 5 min and spoon off excess fat.|Add the chopped onion, sliced mushrooms and finely chopped rosemary and cook for 6 min.|Stir in the garlic and purée for 1 min, then the tomatoes and the half stock cube with 100ml water. Simmer for 10 min.|Cook the rigatoni and toss it through the sauce.|Stir in the crème fraîche and serve with grated cheese.'),
R('truffle-mushroom-rigatoni','Creamy truffle & mushroom rigatoni','🍄','veggie','Italian',25,'Golden mushrooms in a silky cream sauce lifted with a drizzle of truffle oil. Based on a HelloFresh recipe.',
'rigatoni 180, mushroom 250, garlic 2, butter 15, double_cream 120, stock_veg 0.5, spinach 50, parmesan 30, truffle_oil 2, parsley 10',
'Cook the rigatoni in salted boiling water. Keep a mug of the pasta water.|Fry the sliced mushrooms in the butter over a high heat for 8 min until golden.|Add the garlic for 1 min, then the cream, the half stock cube and a splash of pasta water. Simmer for 2 min.|Stir in the spinach to wilt, then toss through the pasta with most of the cheese.|Serve drizzled with truffle oil and topped with parsley and the rest of the cheese.'),
R('penne-ragu-al-forno','Penne ragù al forno','🍝','beef','Italian',50,'Slow-tasting beef ragù baked with penne under bubbling mozzarella.',
'beef_mince 250, penne 180, onion 1, carrot 80, garlic 2, chopped_tom 1, tom_puree 1, oregano 1, stock_beef 1, mozzarella 125, parmesan 20, basil 10, olive_oil 1',
'Fry the chopped onion and grated carrot in the oil for 5 min, then brown the mince for 5 min.|Add the garlic, purée and oregano for 1 min, then the tomatoes and stock cube with 150ml water. Simmer for 20 min.|Heat the oven to 200°C (180°C fan). Cook the penne for 2 min less than the pack says and drain.|Mix the pasta with the ragù and tip into a dish.|Top with torn mozzarella and grated cheese and bake for 15 min until bubbling.|Scatter with basil and serve.'),
R('double-mushroom-penne','Creamy double mushroom penne','🍄','veggie','Italian',25,'Fresh and dried porcini mushrooms make a deep, savoury cream sauce. Based on a HelloFresh recipe.',
'penne 180, mushroom 250, porcini 10, garlic 2, creme_fraiche 150, stock_veg 1, oregano 0.5, spinach 60, parmesan 20, olive_oil 1',
'Soak the porcini in 150ml boiling water for 10 min, then chop, keeping the liquid.|Cook the penne in salted boiling water, then drain.|Fry the sliced mushrooms in the oil for 8 min until golden, then add the porcini, garlic and oregano for 1 min.|Add the porcini liquid (leave any grit behind) and the stock cube and bubble for 2 min.|Stir in the crème fraîche and spinach, then toss through the pasta.|Serve with grated cheese.'),
R('creamy-pea-pasta','Creamy pea pasta','🟢','veggie','Italian',20,'Sweet peas blitzed with ricotta, lemon and mint into a quick, creamy sauce. Written from “creamy peas”: tell Claude if you meant something else.',
'penne 180, peas 200, ricotta 100, parmesan 30, lemon 1, mint 10, garlic 1, butter 15',
'Cook the penne in salted boiling water, adding the peas for the last 3 min. Keep a mug of the pasta water and drain.|Melt the butter and gently cook the garlic for 1 min.|Blend half the peas with the ricotta, most of the cheese, the lemon zest and juice, the mint and a splash of pasta water.|Toss the pasta and remaining peas with the sauce in the pan, loosening with more water.|Serve with the rest of the cheese and extra mint.'),
R('penne-vodka','Penne alla vodka','🍅','veggie','Italian',25,'A silky, pink tomato-cream sauce with a gentle chilli kick. The vodka cooks off, so you can leave it out.',
'penne 180, passata 300, tom_puree 2, double_cream 100, vodka 30, shallot 1, garlic 2, chilli_flakes 0.5, butter 20, parmesan 30, basil 10',
'Cook the penne in salted boiling water. Keep a mug of the pasta water.|Melt the butter and gently fry the finely chopped shallot for 4 min, then the garlic and chilli for 1 min.|Stir in the tomato purée for 1 min, then the vodka and bubble for 1 min.|Add the passata and simmer for 8 min, then stir in the cream.|Toss in the penne with most of the cheese and a splash of pasta water.|Serve with basil and the rest of the cheese.'),

/* ---- Fish, chicken, pie & taco batch, added Nov 2026 ---- */
R('cajun-salmon','Salmon in creamy Cajun sauce','🐟','fish','Cajun',25,'Pan-fried salmon in a spicy, creamy Cajun sauce with tomatoes and spinach, and crispy potatoes. Based on a HelloFresh recipe.',
'salmon 2, cajun 1.5, creme_fraiche 150, garlic 1, cherry_tom 150, spinach 60, baby_potato 400, lemon 0.5, spring_onion 2, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Halve the potatoes, toss with 1 tbsp oil and salt and roast for 25 min.|Rub the salmon with half the Cajun seasoning.|Fry the salmon skin-side down in the rest of the oil for 4 min, flip and cook for 2–3 min more. Set aside.|In the same pan cook the garlic and halved tomatoes for 2 min, then add the remaining Cajun seasoning, the crème fraîche and a splash of water.|Stir in the spinach to wilt and add a squeeze of lemon.|Serve the salmon on the sauce with the potatoes and sliced spring onion.'),
R('sweet-potato-greens','Baked sweet potatoes with buttery greens','🍠','veggie','British',55,'Soft baked sweet potatoes piled with garlicky, miso-butter greens, chickpeas and feta. Written from the dish name (Waitrose’s exact recipe wasn’t found).',
'sweet_potato 600, spring_greens 200, chickpeas 1, butter 30, garlic 2, miso 15, soy 1, lemon 0.5, chilli_flakes 0.25, feta 60, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Prick the sweet potatoes and bake for 45–50 min until soft.|For the last 15 min, toss the drained chickpeas in the oil and roast on a separate tray until crisp.|Melt the butter with the garlic, then stir in the miso and soy.|Add the greens with a splash of water and cook for 4–5 min until tender. Add the lemon juice and chilli.|Split the sweet potatoes and fill with the buttery greens, chickpeas and crumbled feta.'),
R('sea-bass-potatoes','Sea bass with crispy potatoes','🐟','fish','British',40,'Crisp-skinned sea bass on golden garlic and rosemary potatoes with green beans. Based on a Waitrose recipe.',
'sea_bass 2, baby_potato 500, garlic 2, rosemary 2, green_beans 150, lemon 1, butter 15, parsley 5, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Halve the potatoes, boil for 8 min, drain and steam dry.|Toss the potatoes with 1 tbsp oil, the bashed garlic, chopped rosemary and salt and roast for 25–30 min until crisp.|Boil the green beans for 4 min and drain.|Score the fish skin, season and fry skin-side down in the rest of the oil for 3–4 min until crisp. Flip, add the butter and a squeeze of lemon, and cook for 1 min.|Serve on the potatoes and beans with parsley and lemon wedges.'),
R('griddled-chicken-caper','Griddled chicken with garlic & caper butter','🍗','chicken','British',30,'Chargrilled chicken with a melting garlic, lemon and caper butter, new potatoes and salad. Based on a Waitrose recipe.',
'chicken_breast 300, butter 40, garlic 2, capers 20, lemon 1, parsley 10, baby_potato 400, salad 60, olive_oil 1',
'Boil the potatoes for 15–20 min until tender, then drain.|Bash the chicken to an even thickness, rub with the oil and season.|Cook on a hot griddle pan for 5–6 min each side until charred and cooked through. Rest.|Melt the butter with the crushed garlic, chopped capers, lemon zest and a squeeze of juice. Stir in the parsley.|Slice the chicken, spoon over the caper butter and serve with the potatoes and salad.'),
R('hake-butter-sauce','Roast hake with butter sauce & crushed new potatoes','🐟','fish','British',35,'Flaky roast hake with a rich chicken-stock butter sauce over crushed new potatoes. Written from the dish name (Waitrose’s exact recipe wasn’t found).',
'hake 2, baby_potato 500, butter 40, stock_chicken 0.5, lemon 0.5, parsley 10, broccoli 0.5, spring_onion 2, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Boil the potatoes for 15–20 min until tender.|Put the hake on a lined tray, drizzle with the oil, season and roast for 10–12 min until it flakes.|Boil the broccoli florets for 4 min.|For the sauce, simmer the half stock cube in 100ml water until reduced by half, then whisk in the cold butter a piece at a time until glossy. Add the lemon juice.|Lightly crush the potatoes with the spring onions and parsley.|Serve the hake on the potatoes with the broccoli and butter sauce.'),
R('spring-bangers','Spring bangers & spinach mash','🌭','pork','British',35,'Sausages and onion gravy on a creamy spinach mash with peas. Based on a HelloFresh recipe.',
'sausages 6, potato 600, spinach 100, butter 25, milk 50, onion 1, gravy 4, peas 100, dijon 1, olive_oil 1',
'Peel and chop the potatoes and boil for 15–20 min until tender.|Cook the sausages in the oil (or under the grill) for 15 min, turning.|Fry the sliced onion in the sausage pan for 8 min until soft, then add the gravy granules and 250ml boiling water and stir until thick.|Wilt the spinach in a pan, squeeze out the water and chop.|Mash the potatoes with the butter, milk and mustard, then fold in the spinach. Cook the peas.|Serve the sausages on the mash with the peas and onion gravy.'),
R('tarragon-chicken','Pan-fried chicken with tarragon sauce','🌿','chicken','French',35,'Golden chicken with roasted new potatoes, green beans and a creamy tarragon sauce. Based on a HelloFresh recipe.',
'chicken_breast 300, baby_potato 400, tarragon 10, creme_fraiche 150, stock_chicken 0.5, shallot 1, garlic 1, dijon 1, green_beans 150, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Halve the potatoes, toss with 1 tbsp oil and roast for 25–30 min.|Season the chicken and fry in the rest of the oil for 6–7 min each side until cooked through. Rest.|Fry the chopped shallot and garlic in the same pan for 3 min.|Add the half stock cube with 75ml water, the mustard and crème fraîche and simmer for 2 min. Stir in the chopped tarragon.|Boil the green beans for 4 min.|Slice the chicken and serve with the potatoes, beans and sauce.'),
R('garlic-butter-chicken','Crispy chicken in roasted garlic butter','🧄','chicken','British',40,'Crunchy panko chicken drizzled with sweet roasted garlic butter, with wedges and broccoli. Based on a HelloFresh recipe.',
'chicken_breast 300, panko 50, flour 20, eggs 1, garlic 4, butter 30, potato 500, broccoli 1, parsley 10, olive_oil 3',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into wedges, toss with 1 tbsp oil and roast for 30 min. Wrap the unpeeled garlic cloves in foil and roast alongside for 20 min.|Flatten the chicken, dust in flour, dip in beaten egg and coat in panko.|Fry in the rest of the oil for 4–5 min each side until golden and cooked through.|Squeeze the soft roasted garlic out of its skins and mash with the butter, parsley and a pinch of salt.|Boil the broccoli for 4 min.|Serve the chicken topped with the melting garlic butter, with the wedges and broccoli.'),
R('prince-harry-pie','Prince Harry’s chicken pie','🥧','chicken','British',50,'Creamy chicken and mushroom pie under crispy sliced potatoes and cheesy crumbs, with roasted carrots. Based on a HelloFresh recipe.',
'chicken_thigh 300, mushroom 150, onion 1, garlic 1, creme_fraiche 150, stock_chicken 1, potato 400, panko 20, cheddar 30, carrot 300, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the carrots into batons, toss with 1 tbsp oil and roast for 30 min.|Thinly slice the potatoes and boil for 5 min, then drain.|Fry the diced chicken in the rest of the oil for 5 min, add the chopped onion and sliced mushrooms and cook for 5 min, then the garlic for 1 min.|Stir in the crème fraîche and the stock cube with 100ml water and simmer for 3 min. Tip into a small dish.|Layer the potato slices on top, scatter with panko and cheese and bake for 20–25 min until golden.|Serve with the roasted carrots.'),
R('chicken-sweet-potato-tacos','Chicken tacos with roasted sweet potato & guacamole','🌮','chicken','Mexican',35,'Smoky spiced chicken and sweet potato in soft tacos with fresh guacamole and soured cream.',
'chicken_thigh 280, sweet_potato 300, mini_wraps 6, smoked_paprika 1, cumin 1, avocado 1, lime 1, red_onion 0.5, cherry_tom 100, coriander 10, sour_cream 75, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Dice the sweet potato, toss with 1 tbsp oil and half the spices and roast for 25 min.|Slice the chicken, toss with the rest of the spices and fry in the remaining oil for 7–8 min until cooked through.|Make the guacamole: mash the avocado with half the lime juice, finely chopped onion, chopped tomatoes, coriander and salt.|Warm the tortillas.|Fill with sweet potato, chicken, guacamole and soured cream. Serve with lime wedges.'),
R('korean-beef-tacos','Korean-style beef tacos','🌮','beef','Korean-Mexican',25,'Sticky gochujang beef in soft tacos with quick-pickled slaw and spicy mayo. Based on a HelloFresh recipe.',
'beef_mince 250, gochujang 25, soy 1, honey 1, garlic 2, ginger 10, mini_wraps 6, red_cabbage 0.25, carrot 80, rice_vinegar 1, mayo 2, spring_onion 2, sesame_seeds 1, olive_oil 1',
'Finely shred the cabbage and grate the carrot. Toss with the rice vinegar and a pinch of salt and sugar.|Brown the mince in the oil over a high heat for 6 min until crispy.|Add the garlic and ginger for 1 min, then two-thirds of the gochujang, the soy and honey. Cook for 2 min until sticky.|Mix the mayo with the rest of the gochujang.|Warm the tortillas and fill with slaw, beef, spicy mayo, spring onion and sesame seeds.'),
R('chipotle-quesadillas','Cheesy chipotle bean quesadillas','🫓','veggie','Mexican',25,'Smoky chipotle beans, peppers and sweetcorn sealed in crispy, melty tortillas. Based on a HelloFresh recipe.',
'wraps 4, kidney 1, chipotle 30, cheddar 80, red_onion 0.5, pepper 1, sweetcorn 0.5, sour_cream 75, salad 40, lime 0.5, olive_oil 1',
'Fry the chopped onion and pepper in the oil for 5 min.|Add the drained beans, sweetcorn and chipotle paste with a splash of water. Cook for 3 min, roughly mashing some of the beans.|Spread the mix over 2 wraps, top with grated cheese and cover with the other wraps.|Cook each quesadilla in a dry pan for 2–3 min each side until crisp and melted.|Cut into wedges and serve with soured cream, salad and lime.'),
R('chicken-tinga-tacos','Chicken tinga tacos','🌮','chicken','Mexican',40,'Tender shredded chicken simmered in a smoky chipotle-tomato sauce, in soft tacos with avocado.',
'chicken_thigh 350, chipotle 40, chopped_tom 1, onion 1, garlic 2, oregano 1, stock_chicken 0.5, mini_wraps 6, avocado 1, sour_cream 75, lime 1, red_onion 0.5, coriander 10, olive_oil 1',
'Fry the sliced onion in the oil for 6 min until soft, then add the garlic and oregano for 1 min.|Stir in the chipotle paste, chopped tomatoes and the half stock cube with 100ml water.|Add the whole chicken thighs, cover and simmer for 20–25 min until tender.|Lift out the chicken, shred with two forks and stir back into the sauce. Bubble until thick.|Finely slice the red onion and squeeze over half the lime.|Warm the tortillas and fill with tinga, sliced avocado, soured cream, pickled onion and coriander.'),
R('beany-beef-tostadas','Beany beef tostadas rápidas','🌮','beef','Mexican',20,'Crisp baked tortillas piled with spiced beef and beans, cheese and soured cream. Based on a HelloFresh recipe.',
'beef_mince 240, kidney 1, passata 200, pepper 1, cumin 1, smoked_paprika 1, chilli_powder 0.5, worcester 1, wraps 4, cheddar 50, sour_cream 75, salad 40, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Brush the wraps with a little oil and bake on trays for 6–8 min until crisp.|Brown the mince in the rest of the oil for 5 min, then add the chopped pepper for 3 min.|Stir in the spices for 1 min, then the drained beans, passata and Worcestershire sauce. Simmer for 5 min.|Spoon the beef onto the crisp tortillas and top with grated cheese.|Return to the oven for 2–3 min to melt, then top with salad and soured cream.'),
R('mango-chicken-wraps','Mango chutney glazed chicken wraps','🌯','chicken','British-Indian',30,'Sticky curried mango chicken in wraps with cool cucumber-mint yoghurt and sweet potato wedges. Based on a HelloFresh recipe.',
'chicken_breast 280, mango_chutney 50, curry_powder 1, wraps 4, yoghurt 75, cucumber 0.5, mint 5, red_onion 0.5, salad 50, lemon 0.5, sweet_potato 400, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the sweet potato into wedges, toss with 1 tbsp oil and roast for 25 min.|Slice the chicken, toss with the curry powder and fry in the rest of the oil for 6–7 min until cooked through.|Stir in the mango chutney and a splash of water and cook for 1 min until glazed.|Mix the yoghurt with grated cucumber, chopped mint, lemon juice and salt.|Warm the wraps and fill with salad, sliced red onion, chicken and the yoghurt. Serve with the wedges.'),
R('asparagus-prosciutto-pizza','Asparagus, prosciutto & ricotta pizzas','🍕','pork','Italian',25,'White pizzas with creamy ricotta, mozzarella, tender asparagus and salty prosciutto. Based on a Waitrose recipe.',
'pizza_bases 2, ricotta 100, mozzarella 125, asparagus 125, prosciutto 60, garlic 1, lemon 0.5, salad 40, olive_oil 1',
'Heat the oven to 220°C (200°C fan).|Mix the ricotta with the crushed garlic, lemon zest and seasoning and spread over the bases.|Top with torn mozzarella and the asparagus (halved lengthways if thick). Drizzle with the oil.|Bake for 10–12 min until golden and bubbling.|Drape over the prosciutto and serve with the salad.'),
R('turkish-pizzas','Speedy Turkish pizzas','🫓','lamb','Turkish',25,'Lahmacun-style flatbreads topped with spiced lamb, finished with parsley, lemon and yoghurt. Based on a Tesco recipe.',
'flatbread 4, lamb_mince 200, red_onion 1, pepper 0.5, garlic 1, tom_puree 2, cumin 1, smoked_paprika 0.5, chilli_flakes 0.5, parsley 10, lemon 1, yoghurt 75, salad 40',
'Heat the oven to 220°C (200°C fan).|Finely chop half the onion, the pepper and garlic and mix with the lamb, tomato purée, spices and seasoning.|Spread the raw mix thinly over the flatbreads, right to the edges.|Bake on trays for 8–10 min until the lamb is cooked and the edges are crisp.|Top with the rest of the onion (thinly sliced), parsley, salad and a squeeze of lemon. Serve with yoghurt and roll up to eat.'),
R('roast-gnocchi-pesto','Roast gnocchi with veg & spinach pesto','🌿','veggie','Italian',35,'Crispy oven-roasted gnocchi and Mediterranean veg tossed in a fresh spinach pesto. Based on a Tesco recipe.',
'gnocchi 500, courgette 1, pepper 1, red_onion 1, cherry_tom 150, spinach 80, basil 10, cashews 20, parmesan 25, garlic 1, lemon 0.5, olive_oil 3',
'Heat the oven to 220°C (200°C fan).|Toss the gnocchi, chopped courgette, pepper and onion with 1 tbsp oil and seasoning on a large tray. Roast for 20 min, add the tomatoes and roast for 10 min more.|Blend the spinach, basil, nuts, most of the cheese, garlic, lemon juice and the rest of the oil to make a pesto.|Toss the hot gnocchi and veg with the pesto.|Serve with the rest of the cheese.'),
R('salmon-asparagus-tart','Creamy salmon & asparagus tart','🥧','fish','British',40,'Flaky puff pastry filled with salmon, asparagus and a lemony dill custard. Based on a Tesco recipe.',
'puff_pastry 320, salmon 2, asparagus 125, creme_fraiche 150, eggs 1, lemon 0.5, dill 10, salad 60',
'Heat the oven to 200°C (180°C fan). Unroll the pastry onto a lined tray and score a 2cm border. Bake for 10 min.|Mix the crème fraîche, egg, lemon zest, chopped dill and seasoning.|Press down the middle of the pastry, spread over the mixture and top with flaked raw salmon and asparagus.|Bake for 20–25 min until the pastry is golden and the salmon is cooked.|Serve warm with the salad.'),
R('kofta-pittas','Kofta pittas','🥙','lamb','Middle Eastern',30,'Spiced lamb koftas in warm pittas with minty yoghurt, cucumber and salad. Based on a Tesco recipe.',
'lamb_mince 250, onion 0.5, garlic 1, cumin 1, ground_coriander 1, mint 10, pitta 4, yoghurt 100, cucumber 0.5, red_onion 0.5, salad 50, lemon 0.5, chilli_flakes 0.25, olive_oil 1',
'Mix the lamb with the grated onion, garlic, spices, half the chopped mint and seasoning. Shape into 6 sausage-shaped koftas.|Fry or grill in the oil for 10–12 min, turning, until browned and cooked through.|Mix the yoghurt with grated cucumber, the rest of the mint and a squeeze of lemon.|Thinly slice the red onion.|Warm the pittas, split them open and fill with salad, koftas, onion and minty yoghurt. Sprinkle with chilli flakes.'),
R('beef-empanada-pockets','Cheesy beef empanada pockets','🥟','beef','Latin American',40,'Golden pastry pockets stuffed with smoky spiced beef, peppers and melted cheese. Based on a HelloFresh recipe.',
'beef_mince 240, puff_pastry 320, onion 1, pepper 1, cumin 1, smoked_paprika 1, passata 100, cheddar 60, eggs 1, salad 60, sour_cream 75, olive_oil 1',
'Heat the oven to 220°C (200°C fan).|Fry the chopped onion and pepper in the oil for 5 min, then brown the mince for 5 min.|Stir in the spices for 1 min, then the passata. Simmer for 3 min until thick, then cool slightly.|Cut the pastry into 4 rectangles. Spoon the filling onto one half of each, top with cheese, fold over and press the edges with a fork.|Brush with beaten egg and bake for 18–20 min until puffed and golden.|Serve with the salad and soured cream.'),

/* ---- Burgers & buns batch, added Nov 2026 ---- */
R('indian-lamb-burgers','Indian-spiced lamb burgers','🍔','lamb','Indian',35,'Juicy garam masala lamb burgers with minty raita, mango chutney and sweet potato wedges.',
'lamb_mince 250, garam 1, cumin 0.5, ginger 10, garlic 1, coriander 10, buns 2, yoghurt 60, mint 5, cucumber 0.25, red_onion 0.5, salad 40, mango_chutney 20, sweet_potato 400, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the sweet potato into wedges, toss with 1 tbsp oil and roast for 25–30 min.|Mix the lamb with the spices, grated ginger and garlic, chopped coriander and seasoning. Shape into 2 burgers.|Fry or grill in the rest of the oil for 4–5 min each side until cooked through.|Mix the yoghurt with grated cucumber and chopped mint.|Toast the buns and fill with salad, the burgers, raita, sliced red onion and mango chutney. Serve with the wedges.'),
R('chorizo-ciabatta','Chorizo & red pepper ciabatta rolls','🥖','pork','Spanish',25,'Warm crusty ciabatta stuffed with smoky chorizo, sweet roasted peppers and melting mozzarella. Based on a Waitrose recipe.',
'ciabatta 2, chorizo 100, pepper 2, red_onion 1, mozzarella 125, smoked_paprika 0.5, mayo 2, salad 40, olive_oil 1',
'Heat the grill. Slice the peppers and onion and fry in the oil for 8 min until soft and sweet.|Slice the chorizo and add to the pan for 3 min until it releases its oil.|Mix the mayo with the smoked paprika.|Split and toast the ciabatta rolls, fill with the chorizo and peppers and top with torn mozzarella.|Grill for 2 min until melted, then add the salad and paprika mayo.'),
R('pea-falafel','Baked pea falafel with tomato & herb salad','🧆','veggie','Middle Eastern',40,'Bright green pea and chickpea falafel, baked not fried, with a fresh tomato and herb salad. Based on a Waitrose recipe.',
'peas 200, chickpeas 1, garlic 1, cumin 1, ground_coriander 1, mint 10, parsley 10, flour 20, lemon 1, cherry_tom 200, cucumber 0.5, red_onion 0.5, yoghurt 75, pitta 2, olive_oil 2',
'Heat the oven to 200°C (180°C fan). Defrost the peas in boiling water for 1 min and drain well.|Blitz the peas, drained chickpeas, garlic, spices, half the herbs, the flour, lemon zest and seasoning to a rough paste.|Shape into 10–12 small patties, brush with 1 tbsp oil and bake for 20–25 min, turning halfway, until golden.|Chop the tomatoes, cucumber and onion and toss with the rest of the herbs, the lemon juice and remaining oil.|Serve the falafel with the salad, yoghurt and warm pitta.'),
R('steak-frites','Steak frites with tarragon butter','🥩','beef','French',40,'Seared rump steak with crispy oven fries and a melting tarragon and mustard butter. Based on a Waitrose recipe.',
'steak 2, potato 500, butter 30, tarragon 5, garlic 1, dijon 1, lemon 0.25, salad 60, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into thin fries, toss with 1 tbsp oil and salt and roast for 30–35 min, turning once.|Mash the soft butter with the chopped tarragon, crushed garlic, mustard and a squeeze of lemon.|Bring the steaks to room temperature, rub with the rest of the oil and season.|Sear in a very hot pan for 2–3 min each side for medium-rare (longer if you prefer). Rest for 5 min.|Serve the steaks topped with a slice of tarragon butter, with the fries and salad.'),
R('bbq-mushroom-bun','BBQ mushrooms in a bun','🍄','veggie','American',35,'Sticky BBQ-glazed portobello mushrooms with melted cheese and crunchy slaw in a bun, with wedges. Based on a HelloFresh recipe.',
'portobello 4, bbq 3, buns 2, cheddar 40, red_cabbage 0.25, carrot 80, mayo 2, rice_vinegar 1, potato 500, smoked_paprika 0.5, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into wedges, toss with 1 tbsp oil and the paprika and roast for 30 min.|Brush the mushrooms with the rest of the oil and roast on a tray for 12 min.|Brush with the BBQ sauce, top with cheese and roast for 5 min more.|Shred the cabbage and grate the carrot and mix with the mayo and rice vinegar.|Toast the buns and fill with slaw and two mushrooms each. Serve with the wedges.'),
R('cranberry-sausage-burger','Oregano & cranberry sausage burgers','🍔','pork','British',35,'Herby pork burgers with a sweet-sharp cranberry topping and melted cheese, with crispy wedges. Based on a HelloFresh recipe.',
'pork_mince 250, oregano 1, garlic 1, cranberry 2, buns 2, cheddar 30, red_onion 0.5, salad 40, mayo 1, potato 500, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into wedges, toss with 1 tbsp oil and roast for 30 min.|Mix the pork with the oregano, crushed garlic and seasoning and shape into 2 burgers.|Fry in the rest of the oil for 5–6 min each side until cooked through. Top with cheese for the last minute.|Toast the buns and spread with mayo.|Fill with salad, the burgers, a spoonful of cranberry sauce and sliced red onion. Serve with the wedges.'),
R('herby-burgers','Herby beef burgers','🍔','beef','British',35,'Juicy beef burgers packed with parsley, oregano and mustard, with cheese, salad and chunky chips. Based on a HelloFresh recipe.',
'beef_mince 300, parsley 10, oregano 1, garlic 1, dijon 1, buns 2, cheddar 40, red_onion 0.5, salad 40, mayo 2, potato 500, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Cut the potatoes into chunky chips, toss with 1 tbsp oil and salt and roast for 30–35 min.|Mix the beef with the chopped parsley, oregano, crushed garlic, mustard and seasoning. Shape into 2 burgers.|Fry in the rest of the oil for 4–5 min each side, adding the cheese for the last minute.|Toast the buns and spread with mayo.|Build the burgers with salad and sliced red onion and serve with the chips.'),

/* ---- Stews, tagines & more, added Nov 2026 ---- */
R('sausage-naanizza','Italian-inspired sausage naan-izza','🍕','pork','Italian',20,'Naan bread pizzas topped with herby sausage, tomato, peppers and melting mozzarella. Based on a HelloFresh recipe.',
'naan 2, sausages 3, passata 150, oregano 1, pepper 1, red_onion 0.5, mozzarella 125, chilli_flakes 0.25, salad 50, olive_oil 1',
'Heat the oven to 220°C (200°C fan).|Squeeze the sausage meat out of the skins and fry in small pieces in the oil for 5 min until golden. Add the sliced pepper and onion for 3 min.|Mix the passata with the oregano and seasoning and spread over the naans.|Top with the sausage, peppers and torn mozzarella and sprinkle with chilli flakes.|Bake for 8–10 min until bubbling. Serve with the salad.'),
R('roast-chicken-ciabatta','Roast chicken ciabatta with tarragon mayo','🥖','chicken','British',35,'Juicy roast chicken in warm ciabatta with a fresh tarragon and lemon mayo, tomatoes and leaves. Based on a Waitrose recipe.',
'chicken_breast 280, ciabatta 2, tarragon 5, mayo 3, lemon 0.5, dijon 1, cherry_tom 100, salad 50, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Rub the chicken with the oil, season and roast for 20–25 min until cooked through. Rest, then slice.|Mix the mayo with the chopped tarragon, mustard, lemon zest and a squeeze of juice.|Warm the ciabatta in the oven for 3 min, then split.|Spread with the tarragon mayo and fill with salad, sliced tomatoes and the chicken.'),
R('mexican-chicken-stew','Mexican-style chicken & sweetcorn stew','🌽','chicken','Mexican',30,'A smoky, gently spiced chicken, pepper, bean and sweetcorn stew with rice and soured cream. Based on a HelloFresh recipe.',
'chicken_thigh 300, onion 1, pepper 1, garlic 2, cumin 1, smoked_paprika 1, chilli_powder 0.5, chopped_tom 1, black_beans 0.5, sweetcorn 0.5, stock_chicken 0.5, rice 150, sour_cream 75, lime 0.5, coriander 10, olive_oil 1',
'Rinse the rice and cook it in boiling water for 10–12 min, then drain.|Dice the chicken and fry in the oil for 5 min until golden. Add the chopped onion and pepper for 4 min.|Stir in the garlic and spices for 1 min.|Add the tomatoes, drained beans, sweetcorn and the half stock cube with 100ml water. Simmer for 12 min until the chicken is cooked.|Squeeze in the lime and season.|Serve over the rice with soured cream and coriander.'),
R('moroccan-meatballs','Moroccan meatballs with chickpeas','🧆','beef','Moroccan',35,'Warmly spiced beef meatballs simmered with chickpeas in tomato sauce, with herby couscous.',
'beef_mince 250, onion 1, garlic 2, ras_el_hanout 2, cinnamon 0.5, chopped_tom 1, chickpeas 1, honey 0.5, stock_veg 1, couscous 150, coriander 10, yoghurt 60, olive_oil 1',
'Mix the beef with half the grated onion, 1 tsp ras el hanout and seasoning. Roll into 12 meatballs.|Brown the meatballs in the oil for 5 min, then remove.|Fry the rest of the onion for 4 min, then the garlic, remaining ras el hanout and cinnamon for 1 min.|Add the tomatoes, drained chickpeas, honey and 100ml water. Return the meatballs and simmer for 12 min.|Make the couscous with the stock cube and 200ml boiling water, cover for 5 min, then fluff with chopped coriander.|Serve with a spoonful of yoghurt.'),
R('bacon-fish-lentils','Bacon-wrapped fish with creamy lentils','🐟','fish','British',30,'Flaky white fish wrapped in smoky streaky bacon, on creamy mustardy lentils with spinach. Based on a Waitrose recipe.',
'cod 2, streaky_bacon 4, green_lentils 1, shallot 1, garlic 1, creme_fraiche 75, dijon 1, stock_chicken 0.5, spinach 80, lemon 0.5, parsley 5, olive_oil 1',
'Heat the oven to 200°C (180°C fan).|Wrap each fish fillet in 2 bacon rashers, put on a lined tray and roast for 12–15 min until the bacon is crisp and the fish flakes.|Meanwhile fry the chopped shallot in the oil for 4 min, then the garlic for 1 min.|Add the drained lentils and the half stock cube with 75ml water and simmer for 3 min.|Stir in the crème fraîche, mustard and spinach until wilted. Add a squeeze of lemon.|Serve the fish on the lentils with parsley.'),
R('mango-spiced-chicken','Mango chutney glazed spiced chicken','🍗','chicken','British-Indian',30,'Spiced chicken breast with a sticky mango chutney glaze, crispy potatoes, green beans and minty yoghurt. Based on a HelloFresh recipe.',
'chicken_breast 300, curry_powder 1.5, mango_chutney 40, baby_potato 400, green_beans 150, yoghurt 75, mint 5, lemon 0.5, olive_oil 2',
'Heat the oven to 220°C (200°C fan). Halve the potatoes, toss with 1 tbsp oil and half the curry powder and roast for 25 min.|Rub the chicken with the rest of the curry powder and oil.|Fry for 5 min each side, then brush with the mango chutney and roast on the potato tray for 8–10 min until cooked through and sticky.|Boil the green beans for 4 min.|Mix the yoghurt with the chopped mint and a squeeze of lemon.|Slice the chicken and serve with the potatoes, beans and minty yoghurt.'),
R('middle-eastern-lamb-stew','Middle Eastern-style lamb stew','🍲','lamb','Middle Eastern',35,'Spiced lamb with chickpeas, carrots and tomatoes, served over couscous with minty yoghurt. Based on a HelloFresh recipe.',
'lamb_mince 250, onion 1, carrot 100, garlic 2, cumin 1, ras_el_hanout 1, cinnamon 0.5, chopped_tom 1, chickpeas 1, stock_chicken 0.5, couscous 150, yoghurt 60, mint 5, olive_oil 1',
'Brown the lamb in the oil for 5 min and spoon off excess fat.|Add the chopped onion and diced carrot and cook for 5 min.|Stir in the garlic and spices for 1 min.|Add the tomatoes, drained chickpeas and the half stock cube with 150ml water. Simmer for 15 min until the carrots are tender.|Make the couscous with 200ml boiling water, cover for 5 min and fluff up.|Serve the stew over the couscous with yoghurt and mint.'),
R('harissa-chicken-bulgur','Harissa chicken on jewelled bulgur','💎','chicken','Middle Eastern',30,'Smoky harissa chicken on bulgur studded with pomegranate, apricots and herbs. Based on a HelloFresh recipe.',
'chicken_thigh 300, harissa 30, bulgur 150, stock_veg 1, pomegranate 50, apricots 30, red_onion 0.5, parsley 10, mint 5, lemon 1, yoghurt 60, olive_oil 1',
'Coat the chicken in half the harissa and season.|Simmer the bulgur in 350ml water with the stock cube for 12 min, then drain any excess and leave covered.|Fry the chicken in the oil for 5–6 min each side until charred and cooked through.|Stir the chopped apricots, finely chopped red onion, herbs, pomegranate and lemon juice into the bulgur.|Swirl the rest of the harissa through the yoghurt.|Slice the chicken and serve on the jewelled bulgur with the harissa yoghurt.'),
R('lamb-tagine','Speedy spiced lamb tagine','🫕','lamb','Moroccan',30,'A quick, fragrant lamb tagine with carrot, chickpeas and sweet apricots, served with couscous. Based on a HelloFresh recipe.',
'lamb_mince 250, onion 1, carrot 100, garlic 2, ras_el_hanout 2, chopped_tom 1, chickpeas 0.5, apricots 40, honey 0.5, stock_chicken 0.5, couscous 150, coriander 10, olive_oil 1',
'Brown the lamb in the oil for 5 min and spoon off excess fat.|Add the chopped onion and grated carrot for 5 min, then the garlic and ras el hanout for 1 min.|Stir in the tomatoes, drained chickpeas, chopped apricots, honey and the half stock cube with 150ml water.|Simmer for 12–15 min until thick and rich.|Make the couscous with 200ml boiling water, cover for 5 min and fluff up.|Serve the tagine over the couscous with coriander.'),

/* ---- Risottos, salads, soups & gnocchi, added Nov 2026 ---- */
R('baked-bacon-squash-risotto','Oven-baked bacon, butternut & pea risotto','🎃','pork','Italian',45,'No-stir risotto baked in the oven with roasted squash, smoky bacon and sweet peas. Based on a HelloFresh recipe.',
'risotto_rice 150, lardons 120, butternut 0.5, peas 80, onion 1, garlic 1, stock_chicken 1, parmesan 30, butter 15, olive_oil 1',
'Heat the oven to 200°C (180°C fan). Peel and dice the squash, toss with the oil and roast for 25 min.|In an ovenproof pan, fry the lardons until golden, then add the chopped onion for 4 min and the garlic for 1 min.|Stir in the rice for 1 min, then add the stock cube with 650ml boiling water. Bring to the boil.|Cover with a lid or foil and bake for 20–25 min until the rice is tender.|Stir in the roasted squash, peas, butter and most of the cheese, adding a splash of water if needed. Rest for 2 min.|Serve with the rest of the cheese.'),
R('chicken-mushroom-pea-risotto','Chicken, mushroom & pea risotto','🍄','chicken','Italian',40,'Creamy risotto with golden chicken, mushrooms and peas. Based on a Sainsbury’s recipe.',
'chicken_thigh 250, mushroom 150, peas 80, risotto_rice 150, onion 1, garlic 1, stock_chicken 1, parmesan 30, butter 15, olive_oil 1',
'Dissolve the stock cube in 750ml boiling water.|Dice the chicken and fry in the oil for 5 min until golden. Add the sliced mushrooms for 4 min, then remove.|Fry the chopped onion for 4 min and the garlic for 1 min, then stir in the rice.|Add the stock a ladle at a time, stirring, for 18–20 min.|Return the chicken and mushrooms with the peas for the last 3 min.|Stir in the butter and cheese and rest for 2 min before serving.'),
R('satay-chicken-wraps','Satay chicken & salad wraps','🥜','chicken','Asian',25,'Peanut-glazed chicken with crunchy rainbow salad rolled up in wraps. Based on a Sainsbury’s recipe.',
'chicken_breast 280, peanut_butter 2, soy 1, sweet_chilli 1, lime 0.5, wraps 4, little_gem 1, carrot 80, cucumber 0.5, red_cabbage 0.15, coriander 5, olive_oil 1',
'Whisk the peanut butter, soy, sweet chilli, lime juice and 2 tbsp hot water to make a satay sauce.|Slice the chicken and fry in the oil for 6–7 min until cooked through. Stir in half the sauce to coat.|Shred the lettuce and cabbage and cut the carrot and cucumber into matchsticks.|Warm the wraps and fill with salad, chicken, the rest of the sauce and coriander.|Roll up tightly and cut in half.'),
R('cajun-prawn-risotto','Spicy Cajun prawn risotto','🦐','fish','Cajun',35,'A creamy, gently spicy tomato risotto with Cajun prawns and peppers. Based on a HelloFresh recipe.',
'prawns 180, risotto_rice 150, cajun 1.5, pepper 1, onion 1, garlic 1, chopped_tom 0.5, stock_chicken 1, creme_fraiche 50, spring_onion 2, lemon 0.5, olive_oil 1',
'Dissolve the stock cube in 650ml boiling water.|Fry the chopped onion and pepper in the oil for 5 min, then the garlic and 1 tsp Cajun seasoning for 1 min.|Stir in the rice, then the chopped tomatoes. Add the stock a ladle at a time, stirring, for 18–20 min.|Toss the prawns with the rest of the Cajun seasoning and stir in for the last 3–4 min until pink.|Stir in the crème fraîche and a squeeze of lemon.|Serve topped with sliced spring onion.'),
R('baked-mushroom-risotto','Oven-baked mushroom risotto','🍄','veggie','Italian',40,'An easy, no-stir mushroom risotto finished with crème fraîche, spinach and crispy onions. Based on a HelloFresh recipe.',
'mushroom 250, risotto_rice 150, onion 1, garlic 2, stock_veg 1, creme_fraiche 50, spinach 60, parmesan 30, crispy_onions 15, parsley 5, olive_oil 1',
'Heat the oven to 200°C (180°C fan).|In an ovenproof pan, fry the sliced mushrooms in the oil for 6 min until golden. Add the chopped onion for 4 min and the garlic for 1 min.|Stir in the rice, then the stock cube with 650ml boiling water. Bring to the boil.|Cover and bake for 20–25 min until the rice is tender.|Stir in the crème fraîche, spinach and most of the cheese.|Serve topped with crispy onions, parsley and the rest of the cheese.'),
R('orzo-risotto','Lemony orzo risotto','🍋','veggie','Italian',25,'Risotto-style orzo with courgette, peas, spinach and a creamy lemon finish. Based on a HelloFresh recipe.',
'orzo 160, courgette 1, peas 80, spinach 50, lemon 1, garlic 1, stock_veg 1, cream_cheese 50, parmesan 30, basil 10, olive_oil 1',
'Dissolve the stock cube in 500ml boiling water.|Fry the diced courgette in the oil for 4 min, then add the garlic for 1 min.|Stir in the orzo, then add the stock a little at a time, stirring, for 10–12 min until tender and creamy.|Add the peas and spinach for the last 2 min.|Stir in the soft cheese, lemon zest and juice and most of the cheese. Season.|Serve with torn basil and the rest of the cheese.'),
R('paprika-chicken-avocado-salad','Paprika chicken & avocado salad','🥑','chicken','Mexican',25,'Smoky paprika chicken over a fresh salad of avocado, tomatoes and sweetcorn with a lime yoghurt dressing. Based on a Waitrose recipe.',
'chicken_breast 280, smoked_paprika 1.5, avocado 1, salad 80, cherry_tom 150, red_onion 0.5, sweetcorn 0.5, lime 1, yoghurt 50, coriander 5, olive_oil 2',
'Rub the chicken with the paprika, 1 tbsp oil and seasoning.|Cook on a hot griddle or frying pan for 6–7 min each side until cooked through. Rest, then slice.|Mix the yoghurt with half the lime juice and a pinch of salt.|Toss the salad leaves, halved tomatoes, sliced onion and drained sweetcorn with the rest of the oil and lime.|Top with sliced avocado and the chicken, drizzle with the dressing and scatter with coriander.'),
R('tandoori-chicken-salad','Tandoori chicken salad','🥗','chicken','Indian',30,'Charred tandoori chicken on crisp lettuce, cucumber and tomato with minty yoghurt and warm naan. Based on a Waitrose recipe.',
'chicken_breast 280, tandoori_paste 40, yoghurt 100, little_gem 1, cucumber 0.5, red_onion 0.5, cherry_tom 100, mint 5, coriander 5, lemon 0.5, naan 2',
'Mix the tandoori paste with half the yoghurt and coat the chicken. Leave for 10 min (or longer in the fridge).|Grill or griddle the chicken for 6–7 min each side until charred and cooked through. Rest, then slice.|Mix the rest of the yoghurt with chopped mint, a squeeze of lemon and salt.|Chop the lettuce, cucumber, tomatoes and onion and pile onto plates.|Top with the chicken, minty yoghurt and coriander. Serve with warm naan.'),
R('pork-larb','Laotian-style pork larb','🥬','pork','Laotian',25,'Zingy minced pork with lime, chilli, fish sauce and loads of fresh herbs, scooped into lettuce cups with sticky rice. Based on a Waitrose recipe.',
'pork_mince 250, shallot 2, red_chilli 1, lime 2, fish_sauce 1.5, honey 0.5, mint 10, coriander 10, spring_onion 2, little_gem 1, jasmine_rice 150, cucumber 0.5, olive_oil 1',
'Rinse the rice and simmer it in 300ml water, covered, for 12 min. Rest off the heat.|Optional: toast 1 tbsp of the dry rice in a pan until golden, then crush to a powder for crunch.|Fry the pork in the oil over a high heat for 6–7 min until cooked and lightly browned.|Take off the heat and stir in the sliced shallots, chilli, lime juice, fish sauce and honey.|Fold through the herbs, sliced spring onion and toasted rice.|Serve in lettuce cups with the rice and cucumber.'),
R('tomato-pepper-sp-soup','Tomato, red pepper & sweet potato soup','🍅','veggie','British',40,'A thick, smoky and naturally sweet soup with warm crusty bread. Based on a Waitrose recipe.',
'chopped_tom 1, pepper 2, sweet_potato 400, onion 1, garlic 2, smoked_paprika 1, stock_veg 1, creme_fraiche 50, baguette 1, olive_oil 1',
'Chop the onion, peppers and peeled sweet potato.|Fry the onion and peppers in the oil for 6 min, then add the garlic and paprika for 1 min.|Add the sweet potato, chopped tomatoes and the stock cube with 600ml boiling water.|Simmer for 20 min until the sweet potato is soft.|Blend until smooth and season.|Serve with a swirl of crème fraîche and warm baguette.'),
R('cheesy-broccoli-soup','Cheesy broccoli soup','🥦','veggie','British',30,'A velvety broccoli and cheddar soup with a hint of mustard, with crusty bread. Based on a Waitrose recipe.',
'broccoli 1.5, potato 200, onion 1, garlic 1, butter 15, stock_veg 1, milk 150, cheddar 80, dijon 1, baguette 1',
'Melt the butter and fry the chopped onion for 5 min, then the garlic for 1 min.|Add the diced potato, chopped broccoli (stalks too) and the stock cube with 600ml boiling water.|Simmer for 12–15 min until tender.|Blend until smooth, then stir in the milk, mustard and most of the cheese until melted. Season.|Serve topped with the rest of the cheese and warm baguette.'),
R('chicken-chorizo-bean-stew','Chicken, chorizo & butter bean stew','🫘','chicken','Spanish',40,'A smoky one-pot of chicken thighs, chorizo, peppers and creamy butter beans. Based on a Waitrose recipe.',
'chicken_thigh 300, chorizo 60, butter_beans 1, chopped_tom 1, onion 1, pepper 1, garlic 2, smoked_paprika 1, stock_chicken 0.5, spinach 60, parsley 5, baguette 1, olive_oil 1',
'Brown the chicken pieces in the oil for 5 min, then remove.|Fry the sliced chorizo for 2 min, then add the chopped onion and pepper for 5 min.|Stir in the garlic and paprika for 1 min.|Add the tomatoes, drained beans and the half stock cube with 150ml water. Return the chicken and simmer for 20 min.|Stir in the spinach to wilt.|Scatter with parsley and serve with crusty bread.'),
R('french-onion-soup','French onion soup with cheesy croûtons','🧅','veggie','French',60,'Slow-cooked sweet onions in a rich broth, topped with golden Gruyère toasts. Based on a Waitrose recipe.',
'onion 4, butter 30, garlic 1, flour 10, stock_veg 2, soy 1, honey 0.25, baguette 1, gruyere 80',
'Thinly slice the onions. Melt the butter and cook the onions very gently for 35–40 min, stirring often, until deep golden and sticky. Add the honey for the last 5 min.|Stir in the garlic and flour for 1 min.|Add the stock cubes with 800ml boiling water and the soy sauce. Simmer for 15 min and season.|Slice the baguette, toast under the grill, then top with grated Gruyère and grill until bubbling.|Ladle the soup into bowls and float the cheesy croûtons on top. (For the classic version use beef stock. Check the cheese label if you need it vegetarian.)'),
R('gnocchi-pesto-beans','Gnocchi with pesto & green beans','🌿','veggie','Italian',15,'Soft gnocchi and green beans tossed in basil pesto with lemon and cheese. Based on a Waitrose recipe.',
'gnocchi 500, green_beans 150, pesto 60, parmesan 20, lemon 0.5, basil 5, olive_oil 1',
'Cut the green beans into short lengths and boil for 3 min.|Add the gnocchi to the same pan and cook for 2–3 min until they float. Drain, keeping a splash of water.|Toss with the pesto, oil, lemon juice and a little cooking water.|Serve topped with grated cheese and basil.'),
R('tomato-mascarpone-gnocchi','Tomato & mascarpone gnocchi','🍅','veggie','Italian',20,'Pillowy gnocchi in a rich, creamy tomato and mascarpone sauce with basil and spinach. Based on a Waitrose recipe.',
'gnocchi 500, passata 300, mascarpone 75, garlic 2, chilli_flakes 0.25, spinach 50, basil 10, parmesan 20, olive_oil 1',
'Fry the sliced garlic and chilli in the oil for 1 min.|Add the passata and simmer for 8 min until slightly thickened.|Stir in the mascarpone until smooth and season. Add the spinach to wilt.|Cook the gnocchi following the pack and drain.|Toss the gnocchi in the sauce and serve with basil and grated cheese.'),
R('pan-fried-gnocchi','Pan-fried gnocchi with pancetta & peas','🥓','pork','Italian',20,'Crispy golden gnocchi with pancetta, peas and spinach in a light, creamy sauce. Based on a HelloFresh recipe.',
'gnocchi 500, pancetta 65, peas 80, creme_fraiche 75, garlic 1, spinach 50, parmesan 20, olive_oil 1',
'Fry the gnocchi in the oil over a medium-high heat for 6–8 min, turning, until golden and crisp. Remove.|Fry the pancetta in the same pan for 3–4 min until crisp, then add the garlic for 1 min.|Add the peas, crème fraîche and a splash of water and bubble for 2 min.|Stir in the spinach to wilt, then return the gnocchi and toss.|Serve with grated cheese.')
];

const TYPES={
  chicken:{label:'Chicken',c:'var(--t-chicken)'}, beef:{label:'Beef',c:'var(--t-beef)'}, lamb:{label:'Lamb',c:'var(--t-lamb)'}, pork:{label:'Pork',c:'var(--t-pork)'},
  fish:{label:'Fish & seafood',c:'var(--t-fish)'}, veggie:{label:'Vegetarian',c:'var(--t-veggie)'}, vegan:{label:'Vegan',c:'var(--t-vegan)'}
};
const UNITS=['g','ml','each','tin','clove','tsp','tbsp'];

/* Photos: free Unsplash Licence photos for built-in recipes (regenerated from source/photos.json by build.ps1).
   Each entry: [unsplash image id, unsplash photo page slug, photographer, photographer handle] */
/*PHOTOS-START*/const PHOTO_CREDITS={"fajitas":["photo-1666025954339-97a97468de17","a-bowl-of-food-820MBdkIVbA","Hybrid Storytellers","hybridstorytellers"],"tikka":["photo-1603894584373-5ac82b2ae398","brown-and-green-dish-on-brown-wooden-bowl-sqcH2q7lkvo","Raman","potofgold07"],"bolognese":["photo-1622973536968-3ead9e780960","spaghetti-on-white-ceramic-plate-sA3wymYqyaI","Homescreenify","homescreenify"],"red-curry":["photo-1455619452474-d2be8b1e70cd","flat-lay-photography-of-vegetable-soup-on-white-ceramic-cup-XoByiBymX20","emy","emysong_"],"honey-garlic":["photo-1585032226651-759b368d7246","stir-fried-noodles-with-vegetables-wEBg_pYtynw","Orijit Chatterjee","orijit57"],"tuscan":["photo-1485921325833-c519f76c4927","bowl-of-stew-salmon-8pUjhBm4cLw","Jennifer Pallian","foodess"],"pie":["photo-1628642585518-2d63c2beab6b","white-ceramic-bowl-with-white-cream-eBjjnr5pwE0","Jessica Kantak Bailey","jkkantakbailey"],"caesar-wrap":["photo-1666819615040-eff5e52c778a","a-plate-of-food-0Pr5YeRW3Z4","Leanna Myers","myerslk88"],"katsu":["photo-1734313252461-7ed90c07befc","two-plates-of-food-on-a-table-Ldm1PVh_6Nk","Hailey Tong","haileytong"],"lemon-couscous":["photo-1666724405260-48b7a2024809","a-plate-of-food-hp7_lB2OpPo","Danielle Townsend","danitownzen01"],"chorizo-tray":["photo-1599161146640-8d60bd2888e3","brown-bread-with-yellow-fruits-HB0IbmJyyI8","Branimir Petakov","branpeta"],"peri":["photo-1772693471187-6e7d364f99ee","grilled-chicken-leg-with-rice-and-stir-fried-vegetables-pvqcYluq7UI","Mohammad Fahim","dischef"],"lasagne":["photo-1759409117421-1a64af35f118","freshly-baked-lasagna-with-a-basil-leaf-garnish-rBhXooUziZc","Clare Andrews","airfryeruk"],"beef-broccoli":["photo-1760504526069-ff0f8bf6e4ca","beef-and-broccoli-stir-fry-with-vegetables-on-a-red-plate-qKPKDb4_W24","Davis Dai","lingo4208"],"chilli":["photo-1591386767153-987783380885","cooked-food-on-black-bowl-kwJhh14nUcs","Artur Kornakov","arturkornakov"],"cottage":["photo-1696935257293-9ec4f03074a1","a-casserole-dish-on-a-plate-with-a-fork-next-to-it-LHr6EN-B8NQ","The Fry Family Food Co.","fryfamilyfoodco"],"burgers":["photo-1666304752980-678d5c35c911","a-bowl-of-food-PrOraTAsGsY","Nahima Aparicio","nahimaaparicio"],"meatballs":["photo-1515516969-d4008cc6241a","meta-balls-with-noodles-served-on-white-ceramic-bowl-AUAuEgUxg5Q","Jason Leung","ninjason"],"tacos":["photo-1599974579688-8dbdd335c77f","beef-tacos-with-onion-and-cilantro-z_PfaGzeN9E","Jeswin Thomas","jeswinthomas"],"carbonara":["photo-1608756687911-aa1599ab3bd9","pasta-on-white-ceramic-plate-dvgjof0_TP8","Karolina Kołodziejczak","rabbit_in_blue"],"bangers":["photo-1633436375153-d7045cb93e38","a-plate-of-mashed-potatoes-topped-with-gravy-qrDM1rmKgOQ","@parnissazimi","parnissazimi"],"hoisin-pork":["photo-1607328874071-45a9cd600644","pasta-dish-on-black-plate-hJKJQrsNHGQ","Hanxiao Xu","hanxiaoyaaaaa"],"sausage-casserole":["photo-1648455320791-a667c8aab7e4","two-bowls-of-soup-on-a-table-with-crackers-_jyB1ndDFQE","Elena Leya","foodistika"],"korean-beef":["photo-1600289031464-74d374b64991","egg-on-white-ceramic-plate-gPpbFaEkl00","Nikolay Smeh","nikolay_smeh"],"fish-chips":["photo-1579208030886-b937da0925dc","cooked-meat-and-french-fries-in-white-disposable-plate-A_tPBct4tz8","Meelan Bawjee","milodude"],"paella":["photo-1650964807311-970cb88d347c","a-pan-of-food-OjGywUZ-v-w","Colin + Meg","colinandmeg"],"honey-mustard-pork":["photo-1611171711791-b34fa42e9fc2","grilled-meat-on-white-ceramic-plate-oSZ8WBaCbcg","Vladimir Gladkov","vovkapanda"],"teriyaki-salmon":["photo-1684815595429-cf46bff6294f","a-black-bowl-filled-with-meat-and-broccoli-uLQEP0a5DOg","Michael Kahn","mklibrary"],"prawn-spaghetti":["photo-1563379926898-05f4575a45d8","cooked-noodles-with-shrimps-r01ZopTiEV8","Olayinka Babalola","islandsandsunsets"],"bacon-risotto":["photo-1706188458356-45db39746ebd","a-white-plate-topped-with-a-bowl-of-green-soup-FRFWI9RvUDo","Susanna Iovene","susannaiovene"],"tuna-bake":["photo-1620041631703-45ddcef3dae0","white-and-brown-dish-on-silver-tray-WeNvx6MeMr8","Carnivore Style","carnivorestyle"],"mushroom-risotto":["photo-1609770424775-39ec362f2d94","cooked-rice-with-green-vegetable-on-white-round-plate-D9fAmtjC284","Max Griss","grissphoto"],"fish-tacos":["photo-1624300629298-e9de39c13be5","brown-and-green-vegetable-salad-on-brown-paper-bag-zOlZgELBMRg","Deborah Rainford","debsrainford"],"halloumi-couscous":["photo-1691200007743-0652bbbc1d7d","a-white-plate-topped-with-food-next-to-a-knife-and-fork-m3dnHi0ueh0","sheri silver","sheri_silver"],"pesto-gnocchi":["photo-1650475972369-4579ce5e8b71","a-casserole-dish-of-pasta-and-basil-with-a-bottle-of-olive-oil-l45QVRM79Sk","Max Griss","grissphoto"],"pesto-salmon":["photo-1601316585772-ba1e6dae9cfc","cooked-food-on-white-ceramic-plate-Iq0rbPBXJ8Y","@jeff28210","jeff28210"],"shakshuka":["photo-1590412200988-a436970781fa","stainless-steel-fork-on-brown-ceramic-plate-422N7Nwq5XY","Yoav Aziz","yoavaziz"],"chickpea-curry":["photo-1609595781576-1580ff3ee291","cooked-food-on-white-ceramic-plate-ReySmTMcKEQ","Álvaro Bernal","abn"],"dhal":["photo-1626500154744-e4b394ffea16","soup-in-white-ceramic-bowl-WM0qTXnH41Q","VD Photography","vdphotography"],"mac-cheese":["photo-1770351203577-501cf0b074f9","two-servings-of-macaroni-and-cheese-with-salad-JtQBpcam1hQ","Sophie Lee-Tin-Yien","sophielty"],"naan-pizza":["photo-1584365685547-9a5fb6f3a70c","pizza-with-green-leaf-on-brown-wooden-tray-BMVAYjPf6mU","Sahand Hoseini","sahand_hoseini"],"veg-chilli":["photo-1638329389022-daef2efb71b3","a-bowl-of-chili-with-sour-cream-on-top-SlqbDPH6Bic","stephanie monfette","lesbibis"],"quesadillas":["photo-1618040996337-56904b7850b9","sliced-pizza-on-brown-wooden-table-pvTgyioFSTY","Lottie Griffiths","lottiegriffiths"],"halloumi-burger":["photo-1665145323730-2d1e5f77426c","a-burger-and-fries-on-a-plate-NEwBRXyksK8","Benoît Deschasaux","benowa"],"veg-orzo":["photo-1599749011811-d9044d5cf850","cooked-food-on-black-pan-WCm3nrbzmCY","Megan Bucknall","meganmarkham"],"peanut-tofu":["photo-1655427221151-870cc71a63c2","a-bowl-of-food-KwT-QQj1-NE","Drake Whitney","thesupremechips"],"stroganoff":["photo-1644592219048-5c070fd3c91c","a-white-plate-topped-with-pasta-covered-in-sauce-OBxF5lHY3zo","Correen","correenwa03"],"chicken-spinach-curry":["photo-1621515554656-3da68ba128b1","cooked-food-on-white-ceramic-bowl-Tv7Bb8-341w","montatip lilitsanong","montatip"],"pork-lentil-curry":["photo-1678969406353-ead12b1f258a","a-bowl-of-soup-next-to-a-basket-of-pita-bread-Z1xMkhZJcuA","Haseeb Modi","haseebm"],"cauli-korma":["photo-1627906296851-6d9c5e4db592","white-rice-with-green-vegetable-on-white-ceramic-plate-7oYPIMGUhjA","Frank Holleman","fraenkly"],"yellow-thai-curry":["photo-1605461682195-9fd4d079a41d","cooked-food-on-white-ceramic-plate-1hzdlacVPyI","Jezebel Rose","jezebelrose"],"korean-bbq-pork":["photo-1683225757624-86943fb48966","a-close-up-of-a-bowl-of-food-on-a-table-UH_5DgM-JbU","Dynamic Wang","dynamicwang"],"coronation-curry":["photo-1679279727895-bd5c9fb9c1a0","a-blue-and-white-plate-topped-with-rice-and-meat-IR6fuCDPfao","@cohesionsingapore","cohesionsingapore"],"katsu-goodfood":["photo-1677743540715-d4fe04852225","a-close-up-of-a-plate-of-food-on-a-table-TFHV_c7dSi8","@grantlee","grantlee"],"chicken-makhani":["photo-1772730064951-89b427965dbc","a-bowl-of-creamy-chicken-tikka-masala-with-mint-leaves-GOw8q6bRTRM","Mohammad Fahim","dischef"],"goan-fish-curry":["photo-1654863404432-cac67587e25d","a-plate-of-food-Lsiv0oAIfFk","Abhik Paul","thedrunknerd"],"vietnamese-pork":["photo-1701480253822-1842236c9a97","a-bowl-of-soup-with-noodles-meat-and-vegetables-_33r6H_hiz4","Ananas J","yugrey79"],"moghul-korma":["photo-1728542575492-47e02eb3305c","a-bowl-of-soup-on-a-red-table-cK5e26g_Yak","Syed Maaz","syedmaaz904"],"murgh-kari":["photo-1764304733301-3a9f335f0c67","chicken-curry-in-a-white-bowl-with-sauce-VtNLbOAeO68","@varanga22","varanga22"],"thai-beef":["photo-1604908177453-7462950a6a3b","vegetable-dish-on-blue-ceramic-bowl-TvMWBS6TIsg","Farhad Ibrahimzade","ferhadd"],"ginger-lime-stew":["photo-1708782344490-9026aaa5eec7","a-bowl-of-chicken-curry-next-to-a-bowl-of-rice-tsQhEvzU6MQ","@rimshaj123","rimshaj123"],"sweet-potato-dal":["photo-1627366422957-3efa9c6df0fc","soup-with-meat-in-white-ceramic-bowl-eI_Uk6uGCOQ","Yubraj Timsina","yubraj2055"],"five-spice-pork-rice":["photo-1715854501867-5533189a5e71","a-white-plate-topped-with-rice-and-vegetables-dRBVOr5vDEk","Markus Winkler","markuswinkler"],"tomato-prawn-curry":["photo-1781684081404-5c090011b53e","prawns-in-orange-sauce-with-cilantro-and-red-chili-garnish-7n-19fjZZ5Y","67 Digital","67digital"],"thai-pork-bowl":["photo-1679279726937-122c49626802","a-white-bowl-filled-with-food-on-top-of-a-table--TIBsr1UEvs","@cohesionsingapore","cohesionsingapore"],"superfast-pork-noodles":["photo-1615750856719-9b7f225e9273","blue-and-white-ceramic-bowl-with-pasta-ycBYGVebHlE","lili liu","lll85"],"cha-ca-salmon":["photo-1585417791023-a5a6164b2646","thai-inspired-soup-wrfO9SWykdE","charlesdeluvio","charlesdeluvio"],"miso-pork-udon":["photo-1709791582382-26be7baf23c7","a-bowl-of-noodles-and-vegetables-with-chopsticks-XNrHKsvdvUE","wang binghua","wangbinghua"],"spiced-chicken-udon":["photo-1603496987351-f84a3ba5ec85","brown-and-green-food-on-gray-tray-hEMOwugpjJk","@drxyz","drxyz"],"bang-bang-chicken":["photo-1730043033919-1066b2f9d16c","a-plate-of-food-that-is-on-a-table-KQ6n-t_2Pkc","Benjamin Cheng","benjamin_photography"],"sweet-chilli-noodles":["photo-1605704922285-e82455dba38b","cooked-food-on-white-ceramic-bowl-8qFMa9-ljD8","Karolina Kołodziejczak","rabbit_in_blue"],"chicken-laksa":["photo-1775986501486-380ea9539e07","bowl-of-creamy-laksa-with-fried-toppings-and-drink-N4FcjT_jYd4","Kent Chin","kent424"],"sweet-sour-chicken":["photo-1670207415519-3cc41f5768b8","a-bowl-of-food-next-to-a-bucket-of-food-fGrO9QTvWAc","yeojin yun","seoul_lover_lily"],"shanghai-hoisin-chicken":["photo-1603661688298-870c8958ebf8","spaghetti-with-sauce-on-black-plate-YAXnpznjw_I","Behnam Norouzi","behy_studio"],"black-bean-pork":["photo-1565976469782-7c92daebc42e","bowl-of-vegetable-UP5jWpuIvZI","Lindsay Moe","lindsaymoe"],"soba-salad":["photo-1718287904289-f07542ad77ac","a-white-bowl-filled-with-noodles-and-vegetables-5JGvBGsP9sg","Jesi Jnr","jesiofficial"],"pea-pistachio-pasta":["photo-1625128726833-c811f18946b3","green-beans-on-white-ceramic-bowl-VqDT_x3DZj0","Bakd&Raw by Karolin Baitinger","bakdandraw"],"spicy-creamy-chicken-pasta":["photo-1608219992759-8d74ed8d76eb","pasta-dish-on-white-ceramic-bowl-wTBGTwHlf0c","Sama Hosseini","samahosseini"],"chorizo-sweetcorn-pasta":["photo-1664214649076-7b17006db5b5","a-bowl-of-pasta-iZQPLaerwos","Rodrigo Lezcano","rodrigoalezcano"],"bbq-beef-rigatoni":["photo-1771508558231-83a6d757da7a","a-plate-of-pasta-with-meat-sauce-and-cheese-TEO8UkWppS0","gabbiistudios","gabrielonodegba"],"porky-linguine":["photo-1790942596588-c78886a6727c","spaghetti-with-tomato-sauce-dinner-pskLc4-vvCA","Jamie Trinh","jtrinh_artwork"],"cajun-ravioli":["photo-1594610352113-ad218529cfb7","cooked-food-on-white-ceramic-plate-9eIbwtyl4Xs","Tom Dillon","heyitst0m"],"green-mac":["photo-1723362120904-7dd5c27120ff","a-white-plate-topped-with-pasta-and-broccoli-D8WnGFfNLC4","Aditya Sethia","aditya_sethia_97"],"leek-sausage-pasta":["photo-1621996346565-e3dbc646d9a9","penne-pasta-with-meat-sauce-flFd8L7_B3g","Ben Lei","bleiplays33"],"lamb-mushroom-ragu":["photo-1551892374-ecf8754cf8b0","pasta-in-white-ceramic-bowl-2CZ0Zpuj-gU","Krista Stucchio","kristastucchio"],"plant-lasagne":["photo-1586197138382-e1d1479fbb14","brown-and-yellow-dish-on-stainless-steel-tray-k4fxXuvgsrQ","Kristine Tumanyan","kristine_tumanyan"],"herby-pork-ragu":["photo-1645930558646-1fab14e40578","a-white-bowl-filled-with-pasta-and-sauce-oDByHP71S7I","Small Giant","smallgiantdev"],"bacon-arrabbiata":["photo-1673971372358-769a28fa4c81","a-close-up-of-a-plate-of-food-with-pasta-iXzStLbERMk","Fatemeh Rz","dino_trexx"],"penne-rustica":["photo-1788599760377-fb4008792b0a","penne-pasta-with-tomato-sauce-dinner-ogzTpp9c7I4","Zoshua Colah","zoshuacolah"],"tuna-pepper-pasta-salad":["photo-1604497181015-76590d828b75","vegetable-salad-in-white-ceramic-bowl-mW0LIBBHNdE","Eiliv Aceron","shootdelicious"],"chorizo-piquante-salad":["photo-1623855244697-5d8fbe9c7892","fruit-salad-on-white-ceramic-bowl-MaqdFCtH8Oo","Adam Bartoszewicz","bartoshevicz"],"miso-beans-silk":["photo-1616299908398-9af1134ad522","white-ceramic-bowl-with-green-vegetable-dish-cBrhiz8XHAs","Nerfee Mirandilla","nerfee"],"veggie-bolognese-bake":["photo-1584359246645-de78f6f10850","person-in-white-and-red-plaid-shirt-standing-beside-stainless-steel-tray-DSld8czZ0Ns","Louis Hansel","louishansel"],"spinach-pesto-pasta":["photo-1707448460889-e268eb742820","a-plate-of-pasta-with-broccoli-and-parmesan-cheese-docP-fBTnjw","shibani Mishra","shivsm_30"],"mushroom-pancetta-linguine":["photo-1791410299868-2e8efa1de76c","creamy-mushroom-spaghetti-pasta-dish-tZPP-habQcQ","Zoshua Colah","zoshuacolah"],"sausage-meatball-spaghetti":["photo-1632808664408-f8ab196b0523","a-white-plate-topped-with-spaghetti-and-meatballs-g9HxajIIvX4","Mina Rad","miinrad"],"mexican-beef-bake":["photo-1701484185547-a71576b65e1a","a-dish-of-macaroni-and-cheese-with-a-spoon-in-it-VKI3lU4GA1w","Keith Hanson Jr","khjphoto12"],"chorizo-crusted-penne":["photo-1597129049233-346ee90c8129","cooked-food-on-black-frying-pan-9D9ZTZFUFg0","Parsoa Khorsand","parsoakhorsand"],"blue-cheese-cauli-mac":["photo-1667499989723-c4ab9549d63c","a-bowl-of-macaroni-and-cheese-Vkx_ZpQwQgE","Leanna Myers","myerslk88"],"rosemary-lamb-rigatoni":["photo-1606853181531-a3a54d2ad57b","cooked-food-in-black-cooking-pot-jhAhm-mGiRg","Max Griss","grissphoto"],"truffle-mushroom-rigatoni":["photo-1597692493647-35763cb92183","pasta-dish-on-black-plate-QD9A1O2reYY","Jean-claude Attipoe","jcattipoe"],"penne-ragu-al-forno":["photo-1630151317550-db97d275ce2d","pasta-with-green-leaf-on-white-ceramic-plate-8-hNlMngTyQ","Konstantinas Ladauskas","konstantinas"],"double-mushroom-penne":["photo-1473093226795-af9932fe5856","pasta-dish-on-white-plate-ddZYOtZUnBk","Eaters Collective","eaterscollective"],"creamy-pea-pasta":["photo-1625128726788-3fee36746aaa","sliced-cucumber-on-white-ceramic-plate-4MX7xLAiWBc","Bakd&Raw by Karolin Baitinger","bakdandraw"],"penne-vodka":["photo-1676300184847-4ee4030409c0","a-white-plate-topped-with-pasta-covered-in-sauce-w0GyGNyGo6Y","Orkun Orcan","orkunorcan"],"cajun-salmon":["photo-1676300185165-3f543c1fcb72","a-white-plate-topped-with-fish-and-vegetables-3ru16c1mSsU","Orkun Orcan","orkunorcan"],"sweet-potato-greens":["photo-1771161409338-8e35cc1e91ad","a-plate-of-thanksgiving-dinner-with-turkey-and-sides-IzJTWRzipGc","David Todd McCarty","davidtoddmccarty"],"sea-bass-potatoes":["photo-1519233991914-26a44330ccd7","round-gray-plate-with-cooked-food-jMwvJ5aj5eA","@kiltimagh01","kiltimagh01"],"griddled-chicken-caper":["photo-1703219342277-1a78d6b4a27f","a-white-plate-topped-with-meat-and-potatoes-Xm7VDGuvwqg","Hybrid Storytellers","hybridstorytellers"],"hake-butter-sauce":["photo-1763867641066-cd26a5f11105","fish-fillet-with-greens-and-sauce-on-a-white-plate-hc1TswjkUJo","Neon Wang","neonwangphotography"],"spring-bangers":["photo-1658925111653-2c08083c08ff","a-plate-of-food-on-a-table-4rWrcTdacbU","Dmitry Dreyer","deemwave"],"tarragon-chicken":["photo-1721162720198-a6d031314df7","a-white-plate-topped-with-rice-and-meat-covered-in-gravy-QvgHLCOpdJQ","ALLAN LAINEZ","17allansfilms"],"garlic-butter-chicken":["photo-1586793783658-261cddf883ef","a-white-plate-topped-with-fried-food-on-top-of-a-wooden-table-UgckYUoc0tM","Nizar Zulmi","numpanglewat"],"prince-harry-pie":["photo-1650915850372-a92360254e89","a-pan-with-a-pie-in-it-IIlv0_OI6vM","Rob Wicks","robwicks"],"chicken-sweet-potato-tacos":["photo-1613514785940-daed07799d9b","cooked-food-on-white-and-blue-ceramic-plate-E0txIcqePac","Jarritos Mexican Soda","jarritos"],"korean-beef-tacos":["photo-1644085128237-9ba593123ac3","two-tacos-on-a-plate-with-a-lime-wedge-n5jDzmKMT8w","@almaagenciad","almaagenciad"],"chipotle-quesadillas":["photo-1673990349292-ed2dfa7988c9","a-plate-topped-with-a-quesadilla-cut-in-half-_BW-YmENFcM","Benjamin Guardia","benjaminguardia"],"chicken-tinga-tacos":["photo-1627564803215-ad55bad5c5ea","egg-sandwich-on-white-ceramic-plate-iU26ZSJh9yw","montatip lilitsanong","montatip"],"beany-beef-tostadas":["photo-1657770651689-c948d7eed8f1","a-group-of-tacos-on-a-wooden-surface--5ntBM7odrY","Braulio Gómez","braulionte"],"mango-chicken-wraps":["photo-1778168199427-4e839943d20f","three-meat-and-lettuce-wraps-stacked-on-a-table-UmnvfuGPIuE","Yosia Cahyana","yosia39"],"asparagus-prosciutto-pizza":["photo-1584782930656-e2bc1e803fc7","pizza-with-green-leaves-on-brown-wooden-tray-QsKO_VoYoZU","Louis Hansel","louishansel"],"turkish-pizzas":["photo-1771574208749-e3f497200d6f","a-delicious-turkish-pide-with-salad-and-dips-FGQU3YuFS1Q","Adhitya Sibikumar","adhitya_2505"],"roast-gnocchi-pesto":["photo-1579349443343-73da56a71a20","pasta-dish-on-white-ceramic-bowl-Zmhi-OMDVbw","Sebastian Coman Photography","sebastiancoman"],"salmon-asparagus-tart":["photo-1587206667979-708ab47b5adc","pizza-on-black-round-plate-cHgnxl9Gl5c","Natalia Y.","foxfox"],"kofta-pittas":["photo-1777716003985-68fed08d0c7e","a-platter-of-grilled-meats-with-rice-and-pita-bread-2j17J8psiTw","X F","aizerd"],"beef-empanada-pockets":["photo-1769254870299-338bfd99aabd","golden-brown-empanadas-arranged-on-a-white-plate-7ntwSjz8HZE","@dori382","dori382"],"indian-lamb-burgers":["photo-1596956470007-2bf6095e7e16","burger-with-lettuce-and-tomato-JqG9YJWy6eI","amirali mirhashemian","amir_v_ali"],"chorizo-ciabatta":["photo-1595436252086-7496fb8c41e9","bread-with-cheese-and-vegetable-on-brown-wooden-table-hfwJaTMlMkY","@nikizhang1995","nikizhang1995"],"pea-falafel":["photo-1680990999782-ba7fe26e4d0b","a-white-plate-topped-with-meatballs-and-a-salad-WVoLfiKbYBQ","Zoshua Colah","zoshuacolah"],"steak-frites":["photo-1758157835975-1cb4947750df","steak-with-french-fries-and-side-salad-Xr-fw_QXWwM","NHATHUY DUONG","duongnhathuy"],"bbq-mushroom-bun":["photo-1551987840-f62d9c74ae78","selective-focus-photography-of-burger-patty-SvdDhNkzPUo","amirali mirhashemian","amir_v_ali"],"cranberry-sausage-burger":["photo-1513185158878-8d8c2a2a3da3","bread-with-patty-and-sliced-tomato-and-lettuce-burger-OvNsLemoVEw","Haseeb Jamil","haseebjkhan"],"herby-burgers":["photo-1594212699903-ec8a3eca50f5","burger-with-lettuce-and-fries-PxJ9zkM2wdA","Mike","omaha"],"sausage-naanizza":["photo-1634435334343-27e5d92a7870","a-pizza-sitting-on-top-of-a-wooden-cutting-board-s6PRxl4CpF0","Advocator SY","advocator_sy"],"roast-chicken-ciabatta":["photo-1705537459006-f4acbd93c5a3","a-sandwich-cut-in-half-on-a-plate-gX1Y5vEu1jE","Hybrid Storytellers","hybridstorytellers"],"mexican-chicken-stew":["photo-1726514730712-1445245c7f91","a-white-plate-topped-with-a-stew-of-vegetables-4t_H5qLaG3w","Alimentos Fotogénicos","alimentosfotogenicos"],"moroccan-meatballs":["photo-1611515857351-7dbdfd08e1a1","fried-food-on-white-ceramic-plate-SGxuq_I1JYE","gamze türker","gamzeturkerrr"],"bacon-fish-lentils":["photo-1792460238556-62da14e460d2","pan-seared-fish-fillet-dinner-MH8NoIRIQMU","Facundo Luca","faculuca93"],"mango-spiced-chicken":["photo-1670398564097-0762e1b30b3a","chicken-breast-dinner-with-peas-DBVIb_rWUKw","Elena Leya","foodistika"],"middle-eastern-lamb-stew":["photo-1608500219063-e5164085cd6f","white-ceramic-bowl-with-food-JXYdIWqA5IM","Nathan Dumlao","nate_dumlao"],"harissa-chicken-bulgur":["photo-1668665771867-7b3b53d7597a","a-plate-of-food-YWQ6bySSTsc","@andrew_relf","andrew_relf"],"lamb-tagine":["photo-1661083098412-054431ab7112","a-person-eating-a-bowl-of-food-5t2SP3vQz28","sour moha","sour_moha"],"baked-bacon-squash-risotto":["photo-1712407881629-a8ca82a3c64f","a-white-plate-topped-with-a-bowl-of-macaroni-and-cheese-99snZGfYGn8","Hanna","hannahagelin"],"chicken-mushroom-pea-risotto":["photo-1581184953987-5668072c8420","soup-dish-in-brown-ceramic-bowl-KV66QWC8DeE","@laurlanc","laurlanc"],"satay-chicken-wraps":["photo-1666819476544-38ea4e57a3d0","a-plate-of-food-JMITde3RaEE","Leanna Myers","myerslk88"],"cajun-prawn-risotto":["photo-1581073746562-e7fd2422f0eb","white-pasta-with-green-peas-on-white-ceramic-plate-KTLFhRO1Sds","Marika Sartori","jasmineinthewood"],"baked-mushroom-risotto":["photo-1680420574628-225def8eea0a","a-bowl-of-rice-with-mushrooms-and-parsley-MT_aSIwT-wU","@indigo365","indigo365"],"orzo-risotto":["photo-1476124369491-e7addf5db371","risotto-on-white-ceramic-plate-qIPRTMulc-g","Julien Pianetti","julienpian"],"paprika-chicken-avocado-salad":["photo-1761315600943-d8a5bb0c499f","grilled-chicken-salad-with-avocado-and-tomatoes-9TogNg01qzI","Ani Augustine","stinoco"],"tandoori-chicken-salad":["photo-1652545296821-09a023a9fd08","a-close-up-of-a-piece-of-food-on-a-plate-M0SGPmTIOrc","@drxyz","drxyz"],"pork-larb":["photo-1677366801962-483185852615","a-plate-of-food-on-a-wooden-table-jv7_67Mh8g0","Alexandra Tran","alexgoesglobal"],"tomato-pepper-sp-soup":["photo-1547592166-23ac45744acd","soup-in-bowl-fxJTl_gDh28","Ella Olsson","ellaolsson"],"cheesy-broccoli-soup":["photo-1662469843203-b63638ace131","a-bowl-of-soup-with-a-spoon-fcrCj9CkqiQ","Bakd&Raw by Karolin Baitinger","bakdandraw"],"chicken-chorizo-bean-stew":["photo-1708782340356-ce953d631630","a-bowl-of-beans-and-meat-with-a-spoon--tSNOz6t3tQ","@rimshaj123","rimshaj123"],"french-onion-soup":["photo-1549203438-a7696aed4dac","soup-with-green-leaf-in-teacup-FjxEnioTNs0","sheri silver","sheri_silver"],"gnocchi-pesto-beans":["photo-1647482770213-caa163d3c39c","a-white-plate-topped-with-brussel-sprouts-next-to-a-fork-and-AX2BqJYqKZQ","Taine Noble","nottainenoble"],"tomato-mascarpone-gnocchi":["photo-1651773550746-b76fea3cfb70","a-bowl-of-food-bqs2XoayCt8","Max Griss","grissphoto"],"pan-fried-gnocchi":["photo-1703077710733-72c46d2fcff3","a-person-holding-a-bowl-of-fried-food-fJc41-CtN_0","Crunch","crunch_london"]};/*PHOTOS-END*/
const PHOTO_DATA=window.DS_PHOTO_DATA||null; /* standalone file only: photos embedded as data URIs */

/* ------------------------------------------------------------------
   3. STATE (saved in this browser only)
   ------------------------------------------------------------------ */
const KEY='dinnerSwipe.v1';
function freshWeek(){return {seed:Math.floor(Math.random()*1e9),started:Date.now(),decided:{},history:[],front:[],picks:[],have:{},needStaple:{},got:{}};}
function emptyFilters(){return {types:[],maxTime:0,maxCost:0,mains:[],dishes:[],cuisines:[],carbs:[],varyCarbs:false};}
function defaults(){return {v:1,settings:{dinners:5,servings:2,budget:50},filters:emptyFilters(),useUp:{ids:[],mode:'first'},week:freshWeek(),own:[],customIng:{},prices:{},tab:'swipe'};}
let state=defaults();
try{
  const raw=localStorage.getItem(KEY);
  if(raw){const s=JSON.parse(raw); const d=defaults();
    state=Object.assign(d,s); state.settings=Object.assign(d.settings,s.settings||{}); state.filters=Object.assign(d.filters,s.filters||{});
    state.week=Object.assign(freshWeek(),s.week||{});}
}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
/* Your own photos are kept under a separate key so everyday saves stay fast */
const PKEY='dinnerSwipe.photos.v1';
let myPhotos={};
try{myPhotos=JSON.parse(localStorage.getItem(PKEY)||'{}')||{};}catch(e){myPhotos={};}
function savePhotos(){try{localStorage.setItem(PKEY,JSON.stringify(myPhotos));return true;}catch(e){return false;}}

/* ------------------------------------------------------------------
   4. HELPERS
   ------------------------------------------------------------------ */
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>Array.from(el.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'£'+(Math.round((n||0)*100)/100).toFixed(2);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const reduced=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,40)||'item';}

function getIng(id){
  const base=ING[id]||state.customIng[id];
  if(!base) return {id,name:id,aisle:'Other',unit:'each',pack:1,price:0,staple:false,pl:'',q:'',unknown:true};
  const g=Object.assign({},base);
  if(state.prices[id]!=null) g.price=state.prices[id];
  return g;
}
function allIngs(){return Object.keys(ING).concat(Object.keys(state.customIng)).map(getIng);}
function findIngByName(name){const n=String(name||'').trim().toLowerCase(); if(!n) return null; return allIngs().find(g=>g.name.toLowerCase()===n)||null;}
function allRecipes(){return BUILT.concat(state.own);}
function getRecipe(id){return allRecipes().find(r=>r.id===id)||null;}
function recipeCost(r,servings){let c=0;for(const [id,q] of r.i){const g=getIng(id);if(g.staple||!g.pack)continue;c+=q/g.pack*g.price;}return c/r.s*servings;}
function getPick(id){return state.week.picks.find(p=>p.id===id);}
function photoSrc(r){
  if(myPhotos[r.id]) return myPhotos[r.id];
  if(!r.own&&PHOTO_CREDITS[r.id]) return (PHOTO_DATA&&PHOTO_DATA[r.id])||('photos/'+r.id+'.jpg');
  return null;
}
function tileHtml(r){
  const T=TYPES[r.t]||TYPES.veggie, src=photoSrc(r);
  return `<div class="tile" style="--tc:${T.c}" aria-hidden="true">${src?`<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`:esc(r.e||'🍽️')}</div>`;
}
/* Shrink a chosen photo to max 800px and JPEG so it fits in browser storage */
function shrinkPhoto(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{
      const max=800, sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const c=document.createElement('canvas'); c.width=Math.round(img.naturalWidth*sc); c.height=Math.round(img.naturalHeight*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
      try{resolve(c.toDataURL('image/jpeg',0.72));}catch(e){reject(e);}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('unreadable'));};
    img.src=url;
  });
}
async function setMyPhoto(id,file){
  if(!file) return false;
  let data; try{data=await shrinkPhoto(file);}catch(e){toast('That photo couldn’t be read. Try a JPEG or PNG.');return false;}
  const prev=myPhotos[id]; myPhotos[id]=data;
  if(!savePhotos()){ if(prev) myPhotos[id]=prev; else delete myPhotos[id]; toast('Not enough storage on this device for another photo.'); return false; }
  return true;
}

function nice(n){
  if(n>0&&n<0.375) return '¼';
  const r=Math.round(n*2)/2, w=Math.floor(r), h=r-w>0;
  return (w||!h?String(w):'')+(h?'½':'');
}
function fmtQty(q,unit){
  switch(unit){
    case 'g': return q>=1000?(+(q/1000).toFixed(2))+'kg':(q>=50?Math.round(q/5)*5:Math.round(q))+'g';
    case 'ml': return q>=1000?(+(q/1000).toFixed(2))+' litres':(q>=50?Math.round(q/5)*5:Math.round(q))+'ml';
    case 'tsp': case 'tbsp': return nice(q)+' '+unit;
    case 'clove': return nice(q)+(q>1?' cloves':' clove');
    case 'tin': return nice(q)+(q>1?' tins':' tin');
    default: return nice(q);
  }
}
function packText(g){
  if(g.pl) return g.pl; const p=g.pack;
  switch(g.unit){case 'g':return p>=1000?(p/1000)+'kg':p+'g'; case 'ml':return p>=1000?(p/1000)+' litre':p+'ml';
    case 'each':return p>1?'pack of '+p:'each'; case 'tin':return 'tin'; case 'clove':return 'bulb'; default:return 'jar';}
}
function buyText(it){
  const g=it.g; if((g.unit==='each'||g.unit==='tin')&&g.pack===1&&(!g.pl||g.pl==='loose'||g.pl==='each'||g.pl==='whole')) return 'Buy '+it.packs;
  return 'Buy '+it.packs+' × '+packText(g);
}
function sainsburysUrl(g){return 'https://www.sainsburys.co.uk/gol-ui/SearchResults/'+encodeURIComponent(g.q||g.name);}
function weekLabel(){
  const d=new Date(state.week.started||Date.now()); const day=d.getDay(); const mon=new Date(d); mon.setDate(d.getDate()-((day+6)%7));
  return 'Week of '+mon.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
}

/* Icons */
const ICON={
  clock:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  coin:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M14.5 8.5c-.5-.8-1.4-1.2-2.5-1.2-1.8 0-2.8 1.2-2.8 2.7 0 3.4-1.2 5.2-1.7 6h8.5M8 12.5h5"/></svg>',
  list:'<svg class="i" viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg>',
  grain:'<svg class="i" viewBox="0 0 24 24"><path d="M12 21V9M12 9c0-3 2-5 4-6 0 3-2 5-4 6zM12 9c0-3-2-5-4-6 0 3 2 5 4 6zM12 14c0-3 2-5 4-6 0 3-2 5-4 6zM12 14c0-3-2-5-4-6 0 3 2 5 4 6z"/></svg>',
  x:'<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  heart:'<svg class="i" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.8c0 5.8-7.5 10.4-7.5 10.4z"/></svg>',
  undo:'<svg class="i" viewBox="0 0 24 24"><path d="M9 5L4.5 9.5 9 14"/><path d="M4.5 9.5H15a5 5 0 0 1 0 10h-3"/></svg>',
  info:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></svg>',
  tick:'<svg class="i" viewBox="0 0 24 24" style="stroke-width:3"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  filter:'<svg class="i" viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M4 6h16M7 12h10M10 18h4"/></svg>'
};

/* ------------------------------------------------------------------
   5. SHOPPING LIST MATHS
   ------------------------------------------------------------------ */
function buildList(){
  const W=state.week, need={}, used={};
  for(const p of W.picks){const r=getRecipe(p.id); if(!r) continue; const f=p.servings/r.s;
    for(const [id,q] of r.i){need[id]=(need[id]||0)+q*f;(used[id]=used[id]||[]).push(r.n);} }
  const buy=[],cupboard=[],have=[];
  for(const id in need){const g=getIng(id),q=need[id],pack=g.pack||1;const packs=Math.max(1,Math.ceil(q/pack-1e-6));
    const it={id,g,q,packs,cost:packs*g.price,used:used[id]};
    if(g.staple) cupboard.push(it); else if(W.have[id]) have.push(it); else buy.push(it);}
  const ai=a=>{const i=AISLES.indexOf(a);return i<0?99:i;};
  buy.sort((a,b)=>ai(a.g.aisle)-ai(b.g.aisle)||a.g.name.localeCompare(b.g.name));
  cupboard.sort((a,b)=>a.g.name.localeCompare(b.g.name)); have.sort((a,b)=>a.g.name.localeCompare(b.g.name));
  const total=buy.reduce((s,x)=>s+x.cost,0)+cupboard.filter(x=>W.needStaple[x.id]).reduce((s,x)=>s+x.cost,0);
  const usedValue=W.picks.reduce((s,p)=>{const r=getRecipe(p.id);return s+(r?recipeCost(r,p.servings):0);},0);
  return {buy,cupboard,have,total,usedValue};
}
function budgetHtml(L,compact){
  const b=+state.settings.budget||0, t=L.total, pct=b?t/b:0;
  const cls=!b?'':pct>1?'over':pct>0.9?'warn':'';
  const status=!b?'No budget set':pct>1?money(t-b)+' over budget':money(b-t)+' left';
  return `<div class="panel budget ${cls}">
    <div class="budget-top">
      <div><div class="lbl">Estimated shop</div><div class="big num">${money(t)}</div></div>
      <div style="text-align:right"><span class="status-pill num">${status}</span><div class="small muted num" style="margin-top:4px">Budget ${money(b)}</div></div>
    </div>
    <div class="bar" role="img" aria-label="${Math.round(pct*100)}% of budget"><i style="width:${Math.min(100,pct*100)}%"></i></div>
    ${compact?'':`<p class="small muted" style="margin:0">Sainsbury's estimate for whole packs. The food you'll actually eat this week is worth about <b class="num">${money(L.usedValue)}</b>; the rest is left over for next week.</p>`}
  </div>`;
}

/* ------------------------------------------------------------------
   6. SWIPE DECK
   ------------------------------------------------------------------ */
/* Recipe tags used by the filters. Worked out automatically from each recipe's name and ingredients,
   so new and imported recipes are tagged too. */
const MAINS=[
  ['chicken','Chicken',['chicken_breast','chicken_thigh']],
  ['beef','Beef & steak',['beef_mince','beef_strips','steak']],
  ['lamb','Lamb',['lamb_mince']],
  ['pork','Pork',['pork_mince','pork_loin']],
  ['sausage','Sausages',['sausages']],
  ['bacon','Bacon, ham & chorizo',['lardons','pancetta','streaky_bacon','prosciutto','chorizo']],
  ['salmon','Salmon',['salmon']],
  ['whitefish','White fish',['cod','hake','sea_bass']],
  ['tuna','Tuna',['tuna']],
  ['prawns','Prawns',['prawns']],
  ['halloumi','Halloumi',['halloumi']],
  ['tofu','Tofu',['tofu']],
  ['eggs','Eggs (as the star)',[]],
  ['beans','Beans, lentils & chickpeas',['kidney','black_beans','butter_beans','chickpeas','red_lentils','green_lentils']],
  ['mushroom','Mushrooms',['mushroom','portobello','porcini']]
];
const DISHES=[
  ['curry','Curries & dals'],['pasta','Pasta'],['gnocchi','Gnocchi'],['noodles','Noodles'],['risotto','Risotto'],
  ['rice','Rice bowls & fried rice'],['stirfry','Stir-fries'],['soup','Soups'],['salad','Salads'],
  ['stew','Stews, chillies & tagines'],['bake','Pies, bakes & tarts'],['burger','Burgers & sandwiches'],
  ['tacos','Tacos, wraps & quesadillas'],['pizza','Pizzas & flatbreads'],['traybake','Traybakes & roasts'],
  ['grains','Couscous & grains'],['other','Other mains']
];
const PASTA_IDS=['spaghetti','penne','linguine','rigatoni','macaroni','orzo','lasagne','fresh_lasagne','ravioli'];
const NOODLE_IDS=['egg_noodles','rice_noodles','udon','soba'];
const CARBS=[
  ['pasta','Pasta',PASTA_IDS],
  ['rice','Rice',['rice','jasmine_rice','risotto_rice']],
  ['noodles','Noodles',NOODLE_IDS],
  ['potato','Potatoes',['potato','baby_potato']],
  ['sweetpotato','Sweet potato',['sweet_potato']],
  ['gnocchi','Gnocchi',['gnocchi']],
  ['bread','Bread, wraps & naan',['wraps','mini_wraps','buns','naan','pitta','garlic_bread','ciabatta','baguette','flatbread','pizza_bases']],
  ['grains','Couscous & bulgur',['couscous','bulgur']],
  ['pastry','Pastry',['puff_pastry']],
  ['none','No starchy carb',[]]
];
const CARB_LABEL=Object.fromEntries(CARBS.map(c=>[c[0],c[1]]));
const metaCache=new WeakMap();
function rmeta(r){
  let m=metaCache.get(r); if(m) return m;
  const ids=new Set(r.i.map(x=>x[0])), n=String(r.n||'').toLowerCase(), has=a=>a.some(id=>ids.has(id));
  const mains=new Set(MAINS.filter(x=>has(x[2])).map(x=>x[0]));
  const eggQ=(r.i.find(x=>x[0]==='eggs')||[])[1]||0; if(eggQ/(r.s||2)>=1) mains.add('eggs');
  const d=new Set();
  if(/curry|korma|masala|dhal|\bdal\b|makhani|murgh|tikka|laksa/.test(n)) d.add('curry');
  if(has(PASTA_IDS)) d.add('pasta');
  if(ids.has('gnocchi')) d.add('gnocchi');
  if(has(NOODLE_IDS)) d.add('noodles');
  if(/risotto/.test(n)) d.add('risotto');
  if(/rice|bowl|paella|larb/.test(n)&&has(['rice','jasmine_rice'])) d.add('rice');
  if(/stir-fry|stir fry/.test(n)) d.add('stirfry');
  if(/soup|laksa/.test(n)) d.add('soup');
  if(/salad/.test(n)) d.add('salad');
  if(/stew|casserole|tagine|chilli con|chilli$|bean chilli/.test(n)) d.add('stew');
  if(/\bbake\b|\bpie\b|lasagne|\btart\b|al forno|empanada|crusted|\bmac\b/.test(n)) d.add('bake');
  if(/burger|ciabatta|\bbun\b|pitta|sandwich|kofta/.test(n)) d.add('burger');
  if(/taco|wrap|quesadilla|tostada|fajita|burrito/.test(n)) d.add('tacos');
  if(/pizza|naan-izza|flatbread/.test(n)) d.add('pizza');
  if(/traybake|^roast |roast chicken|roast hake/.test(n)) d.add('traybake');
  if(has(['couscous','bulgur'])) d.add('grains');
  if(!d.size) d.add('other');
  const cuis=String(r.c||'Other').split(/-|\/| & /).map(s=>s.trim()).filter(Boolean);
  const carbs=new Set(CARBS.filter(c=>has(c[2])).map(c=>c[0])); if(!carbs.size) carbs.add('none');
  m={ids,mains,dishes:d,cuis,carbs}; metaCache.set(r,m); return m;
}
function carbText(r){return [...rmeta(r).carbs].map(c=>CARB_LABEL[c]).join(' & ');}
/* Carbs already in this week's picks (ignores "no starchy carb") */
function pickedCarbs(){const s=new Set(); state.week.picks.forEach(p=>{const r=getRecipe(p.id); if(r) rmeta(r).carbs.forEach(c=>{if(c!=='none') s.add(c);});}); return s;}
function allCuisines(){const c={}; allRecipes().forEach(r=>rmeta(r).cuis.forEach(x=>c[x]=(c[x]||0)+1)); return Object.entries(c).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));}
function filterCount(){const f=state.filters; return f.types.length+(f.maxTime?1:0)+(f.maxCost?1:0)+f.mains.length+f.dishes.length+f.cuisines.length+(f.carbs||[]).length+(f.varyCarbs?1:0);}

/* Use-up ingredients */
function useMatches(r){const u=state.useUp.ids; if(!u.length) return 0; const ids=rmeta(r).ids; return u.filter(id=>ids.has(id)).length;}
function usesNames(r){const u=state.useUp.ids; if(!u.length) return []; const ids=rmeta(r).ids; return u.filter(id=>ids.has(id)).map(id=>getIng(id).name.replace(/\s*\(.*?\)/,''));}
function passesUseUp(r){const u=state.useUp; if(!u.ids.length||u.mode==='first') return true; const k=useMatches(r); return u.mode==='all'?k===u.ids.length:k>0;}
function leftovers(){
  if(!state.week.picks.length) return [];
  return buildList().buy.map(it=>({id:it.id,g:it.g,left:it.packs*it.g.pack-it.q}))
    .filter(x=>x.left>0&&x.left/x.g.pack>=0.2&&x.g.unit!=='clove').sort((a,b)=>a.g.name.localeCompare(b.g.name));
}

function matchesFilters(r){
  const f=state.filters, m=rmeta(r);
  if(f.types.length&&!f.types.some(x=>x===r.t||(x==='veggie'&&r.t==='vegan'))) return false;
  if(f.maxTime&&r.m>f.maxTime) return false;
  if(f.maxCost&&recipeCost(r,1)>f.maxCost) return false;
  if(f.mains.length&&!f.mains.some(x=>m.mains.has(x))) return false;
  if(f.dishes.length&&!f.dishes.some(x=>m.dishes.has(x))) return false;
  if(f.cuisines.length&&!f.cuisines.some(x=>m.cuis.includes(x))) return false;
  if(f.carbs&&f.carbs.length&&!f.carbs.some(x=>m.carbs.has(x))) return false;
  if(f.varyCarbs&&!getPick(r.id)){const used=pickedCarbs(), c=[...m.carbs].filter(x=>x!=='none'); if(used.size&&c.length&&c.every(x=>used.has(x))) return false;}
  return passesUseUp(r);
}
function deck(){
  const W=state.week;
  return allRecipes().filter(r=>!W.decided[r.id]&&matchesFilters(r))
    .map(r=>({r,k:W.front.indexOf(r.id)>=0?-1e13+W.front.indexOf(r.id):hash(r.id+':'+W.seed)-useMatches(r)*1e10}))
    .sort((a,b)=>a.k-b.k).map(x=>x.r);
}
function cardHtml(r,i,top){
  const T=TYPES[r.t]||TYPES.veggie, cps=recipeCost(r,1);
  const off=i*10, sc=1-i*0.04;
  return `<article class="card${top?' top':''}" data-id="${esc(r.id)}" ${top?'tabindex="0" aria-label="'+esc(r.n)+'. Swipe right to pick, left to skip, or tap for the recipe."':'aria-hidden="true"'} style="--tc:${T.c};transform:translateY(${off}px) scale(${sc});z-index:${10-i}">
    <div class="card-art${photoSrc(r)?' has-photo':''}">${photoSrc(r)?`<img class="card-photo" src="${esc(photoSrc(r))}" alt="" draggable="false" decoding="async">`:`<span class="emoji" aria-hidden="true">${esc(r.e||'🍽️')}</span>`}<span class="type-tag">${T.label}</span>${r.own?'<span class="mine-tag">My recipe</span>':''}
      <span class="stamp pick" aria-hidden="true">PICK</span><span class="stamp nope" aria-hidden="true">SKIP</span></div>
    <div class="card-body">
      <div class="eyebrow">${esc(r.c||'Dinner')}</div>
      <h2>${esc(r.n)}</h2>
      ${r.d?`<p>${esc(r.d)}</p>`:''}
      <div class="facts num"><span>${ICON.clock}${r.m} min</span><span>${ICON.coin}${money(cps)} a serving</span><span>${ICON.grain}${esc(carbText(r))}</span></div>
      ${usesNames(r).length?`<div class="uses">Uses up your ${esc(usesNames(r).join(', '))}</div>`:''}
    </div>
  </article>`;
}
function renderSwipe(){
  const v=$('#view-swipe'), W=state.week, target=state.settings.dinners, picked=W.picks.length, d=deck(), f=state.filters;
  const n=Math.max(target,picked);
  let dots=''; for(let i=0;i<n;i++) dots+=`<span class="dot${i<picked?' on':''}"></span>`;
  const fCount=filterCount()+(state.useUp.ids.length&&state.useUp.mode!=='first'?1:0);
  const chips=filterChips()+`<button class="chip" data-act="type" data-type="" aria-pressed="${!f.types.length}">All</button>`+
    Object.keys(TYPES).map(k=>`<button class="chip" data-act="type" data-type="${k}" aria-pressed="${f.types.includes(k)}"><span class="sw" style="background:${TYPES[k].c}"></span>${k==='fish'?'Fish':TYPES[k].label}</button>`).join('');
  let body;
  if(!d.length){
    const skipped=Object.values(W.decided).filter(x=>x==='L').length;
    body=`<div class="empty"><h2>That's every dinner for now</h2><p>You've seen all the recipes that match your filters${skipped?`, and skipped ${skipped}`:''}.</p>
      <div class="row" style="width:100%;max-width:340px">${skipped?'<button class="btn primary" data-act="reshow">Show skipped again</button>':''}
      ${fCount?'<button class="btn" data-act="clearfilters">Clear filters</button>':''}
      ${picked?'<button class="btn" data-tab="plan">See this week</button>':''}</div></div>`;
  }else{
    body=`<div class="deck" id="deck">${d.slice(0,3).map((r,i)=>cardHtml(r,i,i===0)).reverse().join('')}</div>
    <div class="actions">
      <button class="act sm" data-act="undo" aria-label="Undo last swipe">${ICON.undo}</button>
      <button class="act lg skip" data-act="skip" aria-label="Skip this dinner">${ICON.x}</button>
      <button class="act lg pick" data-act="pick" aria-label="Pick this dinner">${ICON.heart}</button>
      <button class="act sm" data-act="info" aria-label="Show recipe">${ICON.info}</button>
    </div>`;
  }
  v.innerHTML=`<div class="week-strip"><div><b class="num">${picked} of ${target} dinners</b><div class="small muted">${picked>=target?'All picked. Keep swiping or check your list.':'Swipe right to pick, left to skip'}</div></div><div class="dots" aria-hidden="true">${dots}</div></div>
    <div class="chips" role="group" aria-label="Filter recipes">${chips}</div>${body}`;
  const top=$('#deck .card.top'); if(top) bindDrag(top);
}
function bindDrag(card){
  let sx=0,sy=0,dx=0,dy=0,active=false,moved=false;
  card.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;active=true;moved=false;sx=e.clientX;sy=e.clientY;dx=dy=0;try{card.setPointerCapture(e.pointerId);}catch(_){}card.classList.add('dragging');});
  card.addEventListener('pointermove',e=>{if(!active)return;dx=e.clientX-sx;dy=e.clientY-sy;if(Math.abs(dx)>6||Math.abs(dy)>6)moved=true;
    card.style.transform=`translate(${dx}px,${dy*0.25}px) rotate(${dx/18}deg)`;const p=Math.min(1,Math.abs(dx)/100);
    card.style.setProperty('--pick-o',dx>0?p:0);card.style.setProperty('--nope-o',dx<0?p:0);});
  const end=e=>{if(!active)return;active=false;card.classList.remove('dragging');
    if(dx>100) return decide('R'); if(dx<-100) return decide('L');
    card.style.transform='';card.style.setProperty('--pick-o',0);card.style.setProperty('--nope-o',0);
    if(!moved&&e.type==='pointerup') openRecipe(card.dataset.id,'deck');};
  card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
  card.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();decide('R');}else if(e.key==='ArrowLeft'){e.preventDefault();decide('L');}else if(e.key==='Enter'||e.key===' '){e.preventDefault();openRecipe(card.dataset.id,'deck');}});
}
let busy=false;
function decide(dir){
  const card=$('#deck .card.top'); if(!card||busy) return; busy=true; const id=card.dataset.id;
  card.classList.remove('dragging');
  card.style.setProperty(dir==='R'?'--pick-o':'--nope-o',1);
  card.style.transform=`translate(${dir==='R'?140:-140}%, -30px) rotate(${dir==='R'?20:-20}deg)`;
  card.classList.add('leaving');
  setTimeout(()=>{busy=false;applyDecision(id,dir);},reduced()?0:240);
}
function applyDecision(id,dir){
  const W=state.week; W.decided[id]=dir; W.history.push(id); W.front=W.front.filter(x=>x!==id);
  if(dir==='R'&&!getPick(id)) W.picks.push({id,servings:state.settings.servings});
  save(); renderSwipe(); renderNav();
  if(dir==='R'&&W.picks.length===state.settings.dinners) doneSheet();
}
function undo(){
  const W=state.week, id=W.history.pop(); if(!id){toast('Nothing to undo');return;}
  if(W.decided[id]==='R') W.picks=W.picks.filter(p=>p.id!==id);
  delete W.decided[id]; W.front.unshift(id); save(); renderSwipe(); renderNav(); toast('Brought it back');
}
function doneSheet(){
  const L=buildList();
  openSheet(`<h2>That's ${state.settings.dinners} dinners picked</h2>
    <p class="muted">Your shopping list is ready. You can still swipe for more, or change servings for each dinner on the This week tab.</p>
    ${budgetHtml(L,true)}
    <div class="row"><button class="btn primary" data-act="close" data-tab="list">See shopping list</button><button class="btn" data-act="close">Keep swiping</button></div>`);
}

/* ------------------------------------------------------------------
   7. THIS WEEK (plan)
   ------------------------------------------------------------------ */
function renderPlan(){
  const v=$('#view-plan'), W=state.week, target=state.settings.dinners;
  const picks=W.picks.filter(p=>getRecipe(p.id));
  if(!picks.length){
    v.innerHTML=`<div class="empty" style="min-height:60vh"><h2>No dinners picked yet</h2><p>Swipe right on the dinners you fancy and they'll appear here with a shopping list.</p><button class="btn primary" data-tab="swipe">Start swiping</button></div>`;
    return;
  }
  const L=buildList();
  v.innerHTML=`<div class="kv"><h2 style="font-size:22px" class="num">${picks.length} of ${target} dinners</h2><span class="small muted">${esc(weekLabel())}</span></div>
    ${budgetHtml(L,true)}
    ${carbMixHtml(picks)}
    <div class="section-title">Your dinners</div>
    ${picks.map(p=>{const r=getRecipe(p.id);return `<div class="meal">
      ${tileHtml(r)}
      <div class="meal-main"><button data-act="open" data-id="${esc(r.id)}">${esc(r.n)}</button><span class="small muted num">${r.m} min · ${money(recipeCost(r,p.servings))} for ${p.servings} · ${esc(carbText(r))}</span></div>
      <div class="meal-side"><div class="stepper" role="group" aria-label="Servings for ${esc(r.n)}"><button data-act="serv" data-id="${esc(r.id)}" data-d="-1" aria-label="Fewer servings">−</button><span class="num">${p.servings} ${p.servings===1?'person':'people'}</span><button data-act="serv" data-id="${esc(r.id)}" data-d="1" aria-label="More servings">+</button></div>
      <button class="x-btn" data-act="unpick" data-id="${esc(r.id)}">Remove</button></div></div>`;}).join('')}
    <div class="row"><button class="btn primary" data-tab="list">Open shopping list</button>${picks.length<target?'<button class="btn" data-tab="swipe">Pick more</button>':''}</div>
    <button class="btn ghost block" data-act="newweek">Start a new week</button>`;
}
/* Weekly carb mix: counts each carb across the picked dinners and flags repeats */
function carbMixHtml(picks){
  const c={}; picks.forEach(p=>{const r=getRecipe(p.id); if(r) rmeta(r).carbs.forEach(k=>c[k]=(c[k]||0)+1);});
  const keys=CARBS.map(x=>x[0]).filter(k=>c[k]); if(!keys.length) return '';
  const rep=keys.filter(k=>k!=='none'&&c[k]>1);
  return `<div class="panel" style="display:flex;flex-direction:column;gap:8px;padding:12px 14px">
    <div class="kv"><b>Carbs this week</b>${rep.length?`<span class="status-pill" style="background:var(--warn-soft);color:var(--warn)">${rep.length===1?'1 carb repeats':rep.length+' carbs repeat'}</span>`:'<span class="status-pill">All different</span>'}</div>
    <div class="seg">${keys.map(k=>`<span class="chip${k!=='none'&&c[k]>1?' rep':''}" style="cursor:default">${esc(CARB_LABEL[k])}${c[k]>1?` ×${c[k]}`:''}</span>`).join('')}</div>
    ${rep.length?`<p class="small muted" style="margin:0">Want more variety? Turn on <b>Skip carbs I’ve already picked</b> in Filters before you swipe.</p>`:''}
  </div>`;
}
function setServings(id,delta){const p=getPick(id); if(!p) return; p.servings=clamp(p.servings+delta,1,12); save(); renderAll();}
function unpick(id){const W=state.week; W.picks=W.picks.filter(p=>p.id!==id); if(W.decided[id]==='R') delete W.decided[id]; W.history=W.history.filter(x=>x!==id); save(); renderAll(); toast('Removed from this week');}
function addPick(id){const W=state.week; if(!getPick(id)) W.picks.push({id,servings:state.settings.servings}); W.decided[id]='R'; W.history.push(id); save(); renderAll(); toast('Added to this week');}

/* ------------------------------------------------------------------
   8. SHOPPING LIST
   ------------------------------------------------------------------ */
function renderList(){
  const v=$('#view-list'), W=state.week;
  if(!W.picks.length){
    v.innerHTML=`<div class="empty" style="min-height:60vh"><h2>Your list is empty</h2><p>Pick some dinners and the ingredients appear here, grouped by aisle, with a Sainsbury's price estimate.</p><button class="btn primary" data-tab="swipe">Start swiping</button></div>`;
    return;
  }
  const L=buildList(); const groups={};
  for(const it of L.buy)(groups[it.g.aisle]=groups[it.g.aisle]||[]).push(it);
  const gotCount=L.buy.filter(x=>W.got[x.id]).length;
  const itemRow=it=>`<div class="item${W.got[it.id]?' got':''}">
      <button class="check" data-act="got" data-id="${esc(it.id)}" aria-pressed="${!!W.got[it.id]}" aria-label="In basket: ${esc(it.g.name)}">${ICON.tick}</button>
      <button class="item-main" data-act="item" data-id="${esc(it.id)}"><span class="item-name">${esc(it.g.name)}</span><span class="item-sub num">Need ${esc(fmtQty(it.q,it.g.unit))} · ${esc(buyText(it))}</span></button>
      <span class="item-price">${it.g.price?money(it.cost):'<span class="small muted">no price</span>'}</span></div>`;
  v.innerHTML=`${budgetHtml(L,false)}
    <div class="row"><button class="btn" data-act="copylist">Copy list</button>${canShare()?'<button class="btn" data-act="sharelist">Share</button>':''}</div>
    <textarea id="copy-fallback" class="inp code" hidden readonly aria-label="Shopping list text"></textarea>
    <div class="kv"><div class="section-title" style="margin:0">To buy · ${L.buy.length} items</div><span class="small muted num">${gotCount} in basket</span></div>
    ${AISLES.filter(a=>groups[a]).map(a=>`<div class="aisle"><h3>${esc(a)}<span class="num">${money(groups[a].reduce((s,x)=>s+x.cost,0))}</span></h3>${groups[a].map(itemRow).join('')}</div>`).join('')}
    ${L.cupboard.length?`<div class="aisle"><h3>Check your cupboard<span class="num">${money(L.cupboard.filter(x=>W.needStaple[x.id]).reduce((s,x)=>s+x.cost,0))}</span></h3>
      <p class="note">These aren't in the budget. Tap <b>Need to buy</b> for anything you've run out of.</p>
      ${L.cupboard.map(it=>`<div class="item"><span></span><button class="item-main" data-act="item" data-id="${esc(it.id)}"><span class="item-name">${esc(it.g.name)}</span><span class="item-sub num">Need ${esc(fmtQty(it.q,it.g.unit))}${W.needStaple[it.id]?' · '+esc(buyText(it))+' · '+money(it.cost):''}</span></button>
      <button class="toggle" data-act="staple" data-id="${esc(it.id)}" aria-pressed="${!!W.needStaple[it.id]}">${W.needStaple[it.id]?'Buying':'Need to buy'}</button></div>`).join('')}</div>`:''}
    ${L.have.length?`<div class="aisle"><h3>Already have<span>not counted</span></h3>${L.have.map(it=>`<div class="item"><span></span><button class="item-main" data-act="item" data-id="${esc(it.id)}"><span class="item-name">${esc(it.g.name)}</span><span class="item-sub num">Need ${esc(fmtQty(it.q,it.g.unit))}</span></button><button class="toggle" data-act="unhave" data-id="${esc(it.id)}">Add back</button></div>`).join('')}</div>`:''}
    <p class="small muted">Prices are rough Sainsbury's estimates for whole packs, before Nectar prices or offers. Tap any item to correct its price or search for it on Sainsbury's.</p>`;
}
function listText(){
  const L=buildList(), W=state.week; let out=`Dinner Swipe shopping list (${W.picks.length} dinners)\nEstimated £${L.total.toFixed(2)} at Sainsbury's\n`;
  let cur='';
  for(const it of L.buy){ if(it.g.aisle!==cur){cur=it.g.aisle; out+=`\n${cur.toUpperCase()}\n`;} out+=`- ${it.g.name}: ${buyText(it).replace(/^Buy /,'')} (need ${fmtQty(it.q,it.g.unit)})\n`; }
  const st=L.cupboard.filter(x=>W.needStaple[x.id]); if(st.length){out+='\nCUPBOARD TOP-UPS\n'; st.forEach(it=>out+=`- ${it.g.name}\n`);}
  out+='\nDinners: '+W.picks.map(p=>{const r=getRecipe(p.id);return r?`${r.n} (x${p.servings})`:'';}).filter(Boolean).join(', ');
  return out;
}
function canShare(){try{return !!navigator.share&&window.self===window.top;}catch(e){return false;}}
function copyText(text,fallbackId){
  const fb=()=>{const t=fallbackId&&document.getElementById(fallbackId); if(t){t.hidden=false;t.value=text;t.focus();t.select();} toast('Select the text and copy it');};
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>toast('Copied'),fb);} else fb(); }catch(e){fb();}
}
function itemSheet(id){
  const L=buildList(); const it=[...L.buy,...L.cupboard,...L.have].find(x=>x.id===id); const g=getIng(id); const W=state.week;
  const def=(ING[id]||state.customIng[id]||{}).price;
  openSheet(`<h2>${esc(g.name)}</h2>
    ${it?`<p class="muted num">Need ${esc(fmtQty(it.q,g.unit))} this week · ${esc(buyText(it))}</p><p class="small muted">Used in: ${esc(it.used.join(', '))}</p>`:''}
    <div class="panel" style="display:flex;flex-direction:column;gap:10px">
      <label class="field" for="price-inp">Sainsbury's price for ${esc(packText(g))}
        <input id="price-inp" type="number" inputmode="decimal" step="0.01" min="0" value="${g.price.toFixed(2)}"></label>
      <div class="row"><button class="btn primary sm" id="price-save">Save price</button>${state.prices[id]!=null?`<button class="btn sm" id="price-reset">Reset to ${money(def)}</button>`:''}</div>
    </div>
    <div class="row">
      <a class="btn" href="${sainsburysUrl(g)}" target="_blank" rel="noopener">Search Sainsbury's</a>
      ${g.staple?'':(W.have[id]?`<button class="btn" data-act="unhave" data-id="${esc(id)}" data-close="1">Add back to list</button>`:`<button class="btn" data-act="have" data-id="${esc(id)}" data-close="1">I already have this</button>`)}
    </div>`,{onMount:b=>{
      $('#price-save',b).onclick=()=>{const v=parseFloat($('#price-inp',b).value); if(!(v>=0)){toast('Enter a price like 1.25');return;} state.prices[id]=Math.round(v*100)/100; save(); closeSheet(); renderAll(); toast('Price saved');};
      const r=$('#price-reset',b); if(r) r.onclick=()=>{delete state.prices[id]; save(); closeSheet(); renderAll(); toast('Price reset');};
    }});
}

/* ------------------------------------------------------------------
   9. RECIPES TAB
   ------------------------------------------------------------------ */
let recQuery='', recType='';
function renderRecipes(){
  const v=$('#view-recipes');
  if(!$('#rec-search',v)){
    v.innerHTML=`<div class="row"><button class="btn primary" data-act="addrecipe">Add a recipe</button><button class="btn" data-act="importexport">Import / back up</button></div>
      <input id="rec-search" class="search" type="search" placeholder="Search recipes or ingredients" autocomplete="off" aria-label="Search recipes">
      <div class="chips" id="rec-chips" role="group" aria-label="Recipe type"></div>
      <div id="rec-list" style="display:flex;flex-direction:column;gap:10px"></div>`;
    $('#rec-search',v).addEventListener('input',e=>{recQuery=e.target.value;renderRecList();});
  }
  $('#rec-chips',v).innerHTML=filterChips()+[['','All'],...Object.keys(TYPES).map(k=>[k,k==='fish'?'Fish':TYPES[k].label]),['mine','My recipes']]
    .map(([k,l])=>`<button class="chip" data-act="rectype" data-type="${k}" aria-pressed="${recType===k}">${l}</button>`).join('');
  renderRecList();
}
function renderRecList(){
  const q=recQuery.trim().toLowerCase();
  const list=allRecipes().filter(r=>{
    if(recType==='mine'&&!r.own) return false;
    if(recType&&recType!=='mine'&&!(r.t===recType||(recType==='veggie'&&r.t==='vegan'))) return false;
    if(!matchesFilters(r)) return false;
    if(q){const hay=(r.n+' '+(r.c||'')+' '+r.i.map(([id])=>getIng(id).name).join(' ')).toLowerCase(); if(!hay.includes(q)) return false;}
    return true;
  }).sort((a,b)=>useMatches(b)-useMatches(a)||(b.own?1:0)-(a.own?1:0)||a.n.localeCompare(b.n));
  const fc=filterCount()+(state.useUp.ids.length&&state.useUp.mode!=='first'?1:0);
  $('#rec-list').innerHTML=(fc?`<div class="kv small"><span class="muted num">Filters on · showing ${list.length} of ${allRecipes().length}</span><button class="x-btn" data-act="clearfilters">Clear filters</button></div>`:'')+(list.length?list.map(r=>{const T=TYPES[r.t]||TYPES.veggie, u=usesNames(r);return `<button class="rec" data-act="open" data-id="${esc(r.id)}">
    ${tileHtml(r)}
    <div style="min-width:0"><div class="rec-name">${esc(r.n)}</div><div class="rec-meta num">${esc(r.c||T.label)} · ${r.m} min · ${money(recipeCost(r,1))} a serving</div>${u.length?`<div class="uses sm">Uses ${esc(u.join(', '))}</div>`:''}</div>
    ${getPick(r.id)?'<span class="pill">This week</span>':r.own?'<span class="pill mine">Mine</span>':'<span></span>'}</button>`;}).join('')
    :`<div class="empty"><h2>No matches</h2><p>Try a different word or fewer filters, or add it as your own recipe.</p></div>`);
  $('#rec-list').insertAdjacentHTML('beforeend',`<p class="small muted">${allRecipes().length} recipes · ${state.own.length} of them yours</p>`);
}

/* Recipe detail */
let detailServings=2;
function openRecipe(id,from){
  const r=getRecipe(id); if(!r) return; const T=TYPES[r.t]||TYPES.veggie; const p=getPick(id);
  detailServings=p?p.servings:state.settings.servings;
  const draw=()=>{
    const sv=p?p.servings:detailServings, f=sv/r.s;
    const src=photoSrc(r), cr=!myPhotos[id]&&!r.own&&PHOTO_CREDITS[id];
    return `<div class="hero-art${src?' has-photo':''}" style="--tc:${T.c}" aria-hidden="true">${src?`<img class="card-photo" src="${esc(src)}" alt="">`:esc(r.e||'🍽️')}</div>
    ${cr?`<p class="credit">Photo: <a href="https://unsplash.com/photos/${esc(cr[1])}" target="_blank" rel="noopener">${esc(cr[2])} on Unsplash</a>. A similar dish, so yours may look a little different.</p>`:''}
    <div class="photo-btns"><label class="btn sm file-btn" for="ph-${esc(id)}">${myPhotos[id]?'Change my photo':'Use my own photo'}<input type="file" id="ph-${esc(id)}" accept="image/*" data-photo-for="${esc(id)}" aria-label="Choose or take a photo"></label>
      ${myPhotos[id]?`<button class="btn sm" data-act="rmphoto" data-id="${esc(id)}">${PHOTO_CREDITS[id]&&!r.own?'Go back to the stock photo':'Remove my photo'}</button>`:''}</div>
    <div><div class="eyebrow">${esc(r.c||'Dinner')} · ${T.label}${r.own?' · My recipe':''}</div><h2>${esc(r.n)}</h2></div>
    ${r.d?`<p class="muted">${esc(r.d)}</p>`:''}
    <div class="kv"><div class="facts num" style="margin:0"><span>${ICON.clock}${r.m} min</span><span>${ICON.coin}${money(recipeCost(r,1))} a serving</span></div>
      <div class="stepper" role="group" aria-label="Servings"><button data-act="dserv" data-d="-1" aria-label="Fewer servings">−</button><span class="num">${sv} ${sv===1?'person':'people'}</span><button data-act="dserv" data-d="1" aria-label="More servings">+</button></div></div>
    <div class="section-title">Ingredients</div>
    <ul class="ing-list">${r.i.map(([iid,q])=>{const g=getIng(iid);return `<li><span class="q">${esc(fmtQty(q*f,g.unit))}</span><span>${esc(g.name)}${g.staple?' <span class="cup">(cupboard)</span>':''}${state.useUp.ids.includes(iid)?' <span class="pill">Using up</span>':''}</span></li>`;}).join('')}</ul>
    <p class="small muted" style="margin-top:-6px">Plus salt and pepper.</p>
    ${r.st&&r.st.length?`<div class="section-title">Method</div><ol class="method">${r.st.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ol>`:''}
    ${from==='deck'&&!state.week.decided[id]?`<div class="row"><button class="btn" data-act="dskip">Skip</button><button class="btn primary" data-act="dpick">Pick this dinner</button></div>`
      :p?`<button class="btn block" data-act="unpick" data-id="${esc(id)}" data-close="1">Remove from this week</button>`
      :`<button class="btn primary block" data-act="addpick" data-id="${esc(id)}" data-close="1">Add to this week</button>`}
    ${r.own?`<div class="row"><button class="btn sm" data-act="editrecipe" data-id="${esc(id)}">Edit</button><button class="btn sm" data-act="exportone" data-id="${esc(id)}">Copy recipe code</button><button class="btn sm" data-act="delrecipe" data-id="${esc(id)}">Delete</button></div>`:''}`;
  };
  openSheet(draw(),{ctx:{id,from,redraw:()=>{$('#sheet-body').innerHTML=draw();}}});
}

/* ------------------------------------------------------------------
   10. ADD / EDIT YOUR OWN RECIPE
   ------------------------------------------------------------------ */
let rowSeq=0;
function ingRowHtml(name,qty,unit){
  const n=++rowSeq;
  return `<div class="ing-row" data-row>
    <input class="inp ir-name" id="ir-name-${n}" list="ing-names" placeholder="Ingredient, e.g. Brown onion" value="${esc(name||'')}" aria-label="Ingredient name" autocomplete="off">
    <div class="ir-line"><input class="inp ir-qty" id="ir-qty-${n}" type="number" inputmode="decimal" step="any" min="0" placeholder="Amount" value="${qty!=null?esc(qty):''}" aria-label="Amount">
      <select class="inp ir-unit" id="ir-unit-${n}" aria-label="Unit">${UNITS.map(u=>`<option${u===(unit||'g')?' selected':''}>${u}</option>`).join('')}</select>
      <button type="button" class="btn sm" data-act="rmrow" aria-label="Remove ingredient">✕</button></div>
    <div class="small muted ir-known"></div>
    <div class="ir-new" hidden>
      <label for="ir-pack-${n}">Pack size<input class="inp ir-pack" id="ir-pack-${n}" type="number" inputmode="decimal" step="any" min="0" placeholder="e.g. 500"></label>
      <label for="ir-price-${n}">Pack price £<input class="inp ir-price" id="ir-price-${n}" type="number" inputmode="decimal" step="0.01" min="0" placeholder="e.g. 1.50"></label>
      <label for="ir-aisle-${n}" style="grid-column:1/-1">Aisle<select class="inp ir-aisle" id="ir-aisle-${n}">${AISLES.map(a=>`<option${a==='Other'?' selected':''}>${a}</option>`).join('')}</select></label>
      <label class="chk" for="ir-staple-${n}"><input type="checkbox" class="ir-staple" id="ir-staple-${n}"> Cupboard staple (not counted in budget)</label>
    </div></div>`;
}
function syncRow(row){
  const name=$('.ir-name',row).value.trim(), g=findIngByName(name), unit=$('.ir-unit',row), known=$('.ir-known',row), nw=$('.ir-new',row);
  if(g){unit.value=g.unit;unit.disabled=true;nw.hidden=true;known.textContent=`Known ingredient: ${money(g.price)} (${packText(g)})${g.staple?', cupboard staple':''}.`;}
  else{unit.disabled=false;known.textContent=name?'New ingredient. Add a pack size and price to include it in the budget (optional).':'';nw.hidden=!name;}
}
function recipeForm(editId){
  const r=editId?getRecipe(editId):null;
  const rows=r?r.i.map(([id,q])=>{const g=getIng(id);return ingRowHtml(g.name,q,g.unit);}).join(''):ingRowHtml()+ingRowHtml()+ingRowHtml();
  openSheet(`<h2>${r?'Edit recipe':'Add a recipe'}</h2>
  <form id="rform" novalidate style="display:flex;flex-direction:column;gap:12px">
    <label class="field" for="rf-name">Recipe name<input id="rf-name" required value="${esc(r?r.n:'')}" placeholder="e.g. Mum's chicken curry"></label>
    <div class="grid2"><label class="field" for="rf-type">Type<select id="rf-type">${Object.keys(TYPES).map(k=>`<option value="${k}"${r&&r.t===k?' selected':''}>${TYPES[k].label}</option>`).join('')}</select></label>
      <label class="field" for="rf-emoji">Emoji<input id="rf-emoji" value="${esc(r?r.e:'🍽️')}" maxlength="4"></label></div>
    <div class="grid3"><label class="field" for="rf-serves">Serves<input id="rf-serves" type="number" min="1" max="12" value="${r?r.s:2}"></label>
      <label class="field" for="rf-time">Minutes<input id="rf-time" type="number" min="1" value="${r?r.m:30}"></label>
      <label class="field" for="rf-cuisine">Cuisine<input id="rf-cuisine" value="${esc(r?r.c||'':'')}" placeholder="e.g. Indian"></label></div>
    <label class="field" for="rf-desc">Short description<input id="rf-desc" value="${esc(r?r.d||'':'')}" placeholder="One line shown on the card"></label>
    <label class="field" for="rf-photo">Photo (optional)${r&&myPhotos[r.id]?' · choosing a new one replaces the current photo':''}<input id="rf-photo" type="file" accept="image/*"></label>
    <div class="section-title">Ingredients (for the number it serves)</div>
    <div id="rf-rows" style="display:flex;flex-direction:column;gap:10px">${rows}</div>
    <button type="button" class="btn" data-act="addrow">Add another ingredient</button>
    <label class="field" for="rf-steps">Method (one step per line)<textarea id="rf-steps" placeholder="Chop the onion...&#10;Fry for 5 minutes...">${esc(r?(r.st||[]).join('\n'):'')}</textarea></label>
    <div id="rf-err" class="err" role="alert"></div>
    <button class="btn primary block" type="submit">Save recipe</button>
  </form>`,{onMount:b=>{
    fillDatalist();
    $$('[data-row]',b).forEach(syncRow);
    b.addEventListener('input',e=>{const row=e.target.closest('[data-row]'); if(row&&e.target.classList.contains('ir-name')) syncRow(row);});
    $('#rform',b).addEventListener('submit',e=>{e.preventDefault();saveRecipeForm(b,editId);});
  }});
}
async function saveRecipeForm(b,editId){
  const err=$('#rf-err',b); err.textContent='';
  const n=$('#rf-name',b).value.trim(); if(!n){err.textContent='Give the recipe a name.';return;}
  const items=[];
  for(const row of $$('[data-row]',b)){
    const name=$('.ir-name',row).value.trim(); if(!name) continue;
    const q=parseFloat($('.ir-qty',row).value); if(!(q>0)){err.textContent=`Add an amount for ${name}.`;return;}
    let g=findIngByName(name), id;
    if(g) id=g.id; else {
      const unit=$('.ir-unit',row).value, pack=parseFloat($('.ir-pack',row).value), price=parseFloat($('.ir-price',row).value);
      id=newCustomId(name);
      state.customIng[id]={id,name,aisle:$('.ir-aisle',row).value,unit,pack:pack>0?pack:q,price:price>=0?price:0,staple:$('.ir-staple',row).checked,pl:'',q:name};
    }
    items.push([id,q]);
  }
  if(!items.length){err.textContent='Add at least one ingredient.';return;}
  const rec={id:editId||('own_'+Date.now().toString(36)),own:true,n,e:$('#rf-emoji',b).value.trim()||'🍽️',t:$('#rf-type',b).value,
    c:$('#rf-cuisine',b).value.trim(),m:parseInt($('#rf-time',b).value,10)||30,s:clamp(parseInt($('#rf-serves',b).value,10)||2,1,12),
    d:$('#rf-desc',b).value.trim(),i:items,st:$('#rf-steps',b).value.split('\n').map(s=>s.trim()).filter(Boolean)};
  const ix=state.own.findIndex(x=>x.id===rec.id); if(ix>=0) state.own[ix]=rec; else state.own.push(rec);
  save();
  const pf=$('#rf-photo',b); if(pf&&pf.files&&pf.files[0]) await setMyPhoto(rec.id,pf.files[0]);
  closeSheet(); renderAll(); toast(editId?'Recipe updated':'Recipe added to your deck');
}
function newCustomId(name){let base='c_'+slug(name),id=base,i=2;while(ING[id]||state.customIng[id]){id=base+'_'+i++;}return id;}
function fillDatalist(){$('#ing-names').innerHTML=allIngs().map(g=>`<option value="${esc(g.name)}"></option>`).join('');}
function deleteRecipe(id){
  confirmSheet('Delete this recipe?','It will be removed from your deck and this week. This cannot be undone.','Delete',()=>{
    state.own=state.own.filter(r=>r.id!==id); if(myPhotos[id]){delete myPhotos[id]; savePhotos();} const W=state.week; W.picks=W.picks.filter(p=>p.id!==id); delete W.decided[id]; W.history=W.history.filter(x=>x!==id);
    save(); renderAll(); toast('Recipe deleted');},true);
}

/* ------------------------------------------------------------------
   11. IMPORT / BACK UP
   Code format: {"dinnerSwipe":1,"recipes":[{n,e,t,c,m,s,d,i:[[ingId or name, qty, unit?]],st:[...]}],
                 "ingredients":{"id":{name,aisle,unit,pack,price,staple}},"prices":{"id":1.25}}
   ------------------------------------------------------------------ */
function exportCode(onlyId){
  const recs=onlyId?state.own.filter(r=>r.id===onlyId):state.own; const ings={};
  recs.forEach(r=>r.i.forEach(([id])=>{if(state.customIng[id]){const g=state.customIng[id];ings[id]={name:g.name,aisle:g.aisle,unit:g.unit,pack:g.pack,price:g.price,staple:g.staple};}}));
  const out={dinnerSwipe:1,recipes:recs.map(r=>({n:r.n,e:r.e,t:r.t,c:r.c,m:r.m,s:r.s,d:r.d,i:r.i,st:r.st})),ingredients:ings};
  if(!onlyId&&Object.keys(state.prices).length) out.prices=state.prices;
  return JSON.stringify(out);
}
function resolveIng(ref,unit,map){
  if(ING[ref]||state.customIng[ref]) return ref;
  if(map&&map[ref]){const m=map[ref]; const id=/^[a-z0-9_]+$/i.test(ref)&&!ING[ref]?ref:newCustomId(m.name||ref);
    state.customIng[id]={id,name:String(m.name||ref),aisle:AISLES.includes(m.aisle)?m.aisle:'Other',unit:UNITS.includes(m.unit)?m.unit:'each',pack:+m.pack>0?+m.pack:1,price:+m.price>=0?+m.price:0,staple:!!m.staple,pl:m.pl||'',q:m.q||''};
    return id;}
  const f=findIngByName(ref); if(f) return f.id;
  const id=newCustomId(ref); state.customIng[id]={id,name:String(ref),aisle:'Other',unit:UNITS.includes(unit)?unit:'each',pack:1,price:0,staple:false,pl:'',q:''}; return id;
}
function importCode(text){
  let data; try{data=JSON.parse(text.trim());}catch(e){return 'That code isn’t valid. Copy the whole code, including the curly brackets at each end.';}
  const list=Array.isArray(data)?data:(data.recipes||(data.n||data.name?[data]:[])); if(!list.length) return 'No recipes found in that code.';
  const map=data.ingredients||{}; let added=0;
  for(const o of list){
    const n=o.n||o.name; if(!n) continue;
    const items=(o.i||o.ingredients||[]).map(x=>{let ref,q,u; if(Array.isArray(x)){[ref,q,u]=x;}else{ref=x.id||x.name;q=x.qty??x.q;u=x.unit;} q=parseFloat(q)||0; if(!ref) return null; return [resolveIng(String(ref),u,map),q];}).filter(Boolean);
    if(!items.length) continue;
    const t=TYPES[o.t||o.type]?(o.t||o.type):'veggie';
    state.own.push({id:'own_'+Date.now().toString(36)+'_'+(added),own:true,n:String(n),e:o.e||o.emoji||'🍽️',t,c:o.c||o.cuisine||'',m:parseInt(o.m||o.minutes,10)||30,s:clamp(parseInt(o.s||o.serves,10)||2,1,12),d:o.d||o.description||'',i:items,st:(o.st||o.steps||[]).map(String)});
    added++;
  }
  if(data.prices&&typeof data.prices==='object') for(const k in data.prices){const v=+data.prices[k]; if(v>=0&&(ING[k]||state.customIng[k])) state.prices[k]=v;}
  if(!added) return 'No recipes could be read from that code.';
  save(); renderAll(); return added;
}
function importExportSheet(){
  openSheet(`<h2>Import or back up</h2>
    <p class="muted">Recipes you add are saved in this browser only. Copy the backup code to keep them safe or move them to another phone or computer.</p>
    <div class="panel" style="display:flex;flex-direction:column;gap:10px">
      <h3 style="font-size:17px">Add recipes from a code</h3>
      <p class="small muted">Paste a recipe code here, for example one Claude made from your photo of a recipe.</p>
      <textarea id="imp-text" class="inp code" placeholder='{"dinnerSwipe":1,"recipes":[...]}' aria-label="Recipe code to import"></textarea>
      <label class="field" for="imp-file">Or choose a saved code file<input id="imp-file" type="file" accept=".json,.txt,application/json,text/plain"></label>
      <div id="imp-msg" class="err" role="alert"></div>
      <button class="btn primary" id="imp-go">Import recipes</button>
    </div>
    <div class="panel" style="display:flex;flex-direction:column;gap:10px">
      <h3 style="font-size:17px">Back up my recipes and prices</h3>
      <p class="small muted num">${state.own.length} recipes, ${Object.keys(state.prices).length} price changes.</p>
      <button class="btn" id="exp-go" ${state.own.length||Object.keys(state.prices).length?'':'disabled'}>Copy backup code</button>
      <textarea id="exp-text" class="inp code" hidden readonly aria-label="Backup code"></textarea>
    </div>`,{onMount:b=>{
      $('#imp-file',b).addEventListener('change',e=>{const f=e.target.files&&e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{$('#imp-text',b).value=String(rd.result||'');}; rd.readAsText(f);});
      $('#imp-go',b).onclick=()=>{const res=importCode($('#imp-text',b).value); if(typeof res==='number'){closeSheet(); toast(`Added ${res} recipe${res>1?'s':''} to your deck`); recType='mine'; setTab('recipes');} else $('#imp-msg',b).textContent=res;};
      $('#exp-go',b).onclick=()=>copyText(exportCode(),'exp-text');
    }});
}

/* ------------------------------------------------------------------
   12. SETTINGS, FILTERS, CONFIRM
   ------------------------------------------------------------------ */
function settingsSheet(){
  const s=state.settings;
  openSheet(`<h2>Settings</h2>
    <div class="panel" style="display:flex;flex-direction:column;gap:14px">
      <div class="kv"><div><b>Dinners to pick each week</b><div class="small muted">Swiping tells you when you've got enough</div></div>
        <div class="stepper"><button data-act="set" data-k="dinners" data-d="-1" aria-label="Fewer dinners">−</button><span class="num" id="set-dinners">${s.dinners}</span><button data-act="set" data-k="dinners" data-d="1" aria-label="More dinners">+</button></div></div>
      <div class="kv"><div><b>Usual number of people</b><div class="small muted">Used for each new pick; change any dinner on This week</div></div>
        <div class="stepper"><button data-act="set" data-k="servings" data-d="-1" aria-label="Fewer people">−</button><span class="num" id="set-servings">${s.servings}</span><button data-act="set" data-k="servings" data-d="1" aria-label="More people">+</button></div></div>
      <label class="field" for="set-budget">Weekly food budget (£)<input id="set-budget" type="number" inputmode="decimal" min="0" step="1" value="${s.budget}"></label>
      ${state.week.picks.length?'<button class="btn sm" data-act="applyservings">Set every dinner this week to the usual number</button>':''}
    </div>
    <div class="panel" style="display:flex;flex-direction:column;gap:10px">
      <b>Prices</b><p class="small muted">Built-in prices are rough Sainsbury's estimates. ${Object.keys(state.prices).length} changed by you.</p>
      <button class="btn sm" data-act="resetprices" ${Object.keys(state.prices).length?'':'disabled'}>Reset all prices to built-in estimates</button>
    </div>
    <div class="panel" style="display:flex;flex-direction:column;gap:10px">
      <b>Start again</b><p class="small muted">Deletes your recipes, picks, prices and settings from this browser.</p>
      <button class="btn sm danger" data-act="wipe">Delete all my data</button>
    </div>
    <p class="small muted">Dinner Swipe runs entirely in your browser. It doesn't need Claude or an internet connection once loaded, except for the Sainsbury's search links.</p>`,{onMount:b=>{
      $('#set-budget',b).addEventListener('change',e=>{state.settings.budget=Math.max(0,parseFloat(e.target.value)||0);save();renderAll();});
    }});
}
/* The two chips at the start of the Swipe and Recipes chip rows */
function filterChips(){
  const n=filterCount(), u=state.useUp.ids.length;
  return `<button class="chip" data-act="filters" aria-pressed="${n>0}">${ICON.filter}${n?'Filters · '+n:'Filters'}</button>`+
    `<button class="chip" data-act="useup" aria-pressed="${u>0}">🧺 ${u?'Using up · '+u:'Use up'}</button>`;
}
function matchCount(){return allRecipes().filter(matchesFilters).length;}
function showLabel(){
  if(state.tab==='swipe'){const n=deck().length; return n?`Show ${n} dinner${n===1?'':'s'} to swipe`:'No new dinners match';}
  const n=matchCount(); return n?`Show ${n} recipe${n===1?'':'s'}`:'No recipes match';
}
function sheetRedraw(draw,after){const p=$('#sheet-panel'),st=p.scrollTop; $('#sheet-body').innerHTML=draw(); p.scrollTop=st; if(after) after($('#sheet-body'));}
function filterSheet(){
  const draw=()=>{
    const f=state.filters, all=allRecipes();
    const seg=(k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button class="chip" data-act="fset" data-k="${k}" data-v="${v}" aria-pressed="${f[k]===v}">${l}</button>`).join('')}</div>`;
    const multi=(k,opts)=>`<div class="seg">${opts.filter(o=>o[2]>0).map(([v,l,c])=>`<button class="chip" data-act="fmulti" data-k="${k}" data-v="${esc(v)}" aria-pressed="${f[k].includes(v)}">${esc(l)} <span class="cnt num">${c}</span></button>`).join('')}</div>`;
    const mainOpts=MAINS.map(([k,l])=>[k,l,all.filter(r=>rmeta(r).mains.has(k)).length]);
    const dishOpts=DISHES.map(([k,l])=>[k,l,all.filter(r=>rmeta(r).dishes.has(k)).length]);
    const cuisOpts=allCuisines().map(([c,n])=>[c,c,n]);
    const typeOpts=Object.keys(TYPES).map(k=>[k,TYPES[k].label,all.filter(r=>r.t===k||(k==='veggie'&&r.t==='vegan')).length]);
    const carbOpts=CARBS.map(([k,l])=>[k,l,all.filter(r=>rmeta(r).carbs.has(k)).length]);
    const used=[...pickedCarbs()].map(c=>CARB_LABEL[c]);
    return `<h2>Filters</h2>
    <p class="small muted">Pick as many as you like. Within each section a dinner only needs to match one choice.</p>
    <div class="section-title">Main ingredient</div>${multi('mains',mainOpts)}
    <div class="section-title">Carbs</div>${multi('carbs',carbOpts)}
    <button class="chip" data-act="fvary" aria-pressed="${!!f.varyCarbs}">↻ Skip carbs I’ve already picked this week</button>
    ${used.length?`<p class="small muted" style="margin-top:-6px">Already picked: ${esc(used.join(', '))}</p>`:''}
    <div class="section-title">Type of dish</div>${multi('dishes',dishOpts)}
    <div class="section-title">Cuisine</div>${multi('cuisines',cuisOpts)}
    <div class="section-title">Meat, fish or veggie</div>${multi('types',typeOpts)}
    <div class="section-title">Ready in</div>${seg('maxTime',[[0,'Any time'],[15,'15 min or less'],[20,'20 min or less'],[30,'30 min or less'],[45,'45 min or less']])}
    <div class="section-title">Cost a serving</div>${seg('maxCost',[[0,'Any cost'],[2,'Under £2'],[2.5,'Under £2.50'],[3,'Under £3'],[4,'Under £4']])}
    <div class="row sticky-actions"><button class="btn" data-act="clearfilters">Clear all</button><button class="btn primary" data-act="close">${showLabel()}</button></div>`;
  };
  openSheet(draw(),{ctx:{redraw:()=>sheetRedraw(draw)}});
}
let useQuery='';
function useUpSheet(){
  const usage={}; allRecipes().forEach(r=>rmeta(r).ids.forEach(id=>usage[id]=(usage[id]||0)+1));
  const pool=allIngs().filter(g=>!g.staple&&usage[g.id]).sort((a,b)=>a.name.localeCompare(b.name));
  const chip=(g,label)=>`<button class="chip" data-act="useing" data-id="${esc(g.id)}" aria-pressed="${state.useUp.ids.includes(g.id)}">${esc(label||g.name)}</button>`;
  const listHtml=()=>{const q=useQuery.trim().toLowerCase(); const items=pool.filter(g=>!q||g.name.toLowerCase().includes(q));
    return items.length?items.map(g=>chip(g)).join(''):'<p class="small muted">No ingredients match that search.</p>';};
  const draw=()=>{
    const u=state.useUp, left=leftovers(), sel=u.ids.map(getIng);
    return `<h2>Use up ingredients</h2>
    <p class="small muted">Pick what you’ve got in the fridge or left over from this week. Dinners that use them come first and are labelled.</p>
    ${sel.length?`<div class="section-title">Using up</div><div class="seg">${sel.map(g=>`<button class="chip" data-act="useing" data-id="${esc(g.id)}" aria-pressed="true">${esc(g.name)} ✕</button>`).join('')}</div>
    <div class="section-title">Show me</div>
    <div class="seg">${[['first','Dinners using them first'],['any','Only dinners using any'],['all','Only dinners using all']].map(([v,l])=>`<button class="chip" data-act="usemode" data-v="${v}" aria-pressed="${u.mode===v}">${l}</button>`).join('')}</div>`:''}
    ${left.length?`<div class="section-title">Left over from this week’s shop</div><div class="seg">${left.map(x=>chip(x.g,`${x.g.name} · ${fmtQty(x.left,x.g.unit)} spare`)).join('')}</div>`:''}
    <div class="section-title">All ingredients</div>
    <input id="use-search" class="search" type="search" placeholder="Search ingredients, e.g. spinach" autocomplete="off" aria-label="Search ingredients" value="${esc(useQuery)}">
    <div class="seg" id="use-list">${listHtml()}</div>
    <div class="row sticky-actions"><button class="btn" data-act="useclear">Clear</button><button class="btn primary" data-act="close">${showLabel()}</button></div>`;
  };
  const bind=b=>{const s=$('#use-search',b); if(s) s.addEventListener('input',e=>{useQuery=e.target.value; $('#use-list',b).innerHTML=listHtml();});};
  openSheet(draw(),{onMount:bind,ctx:{redraw:()=>sheetRedraw(draw,bind)}});
}
function confirmSheet(title,text,okLabel,onOk,danger){
  openSheet(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="row"><button class="btn" data-act="close">Cancel</button><button class="btn ${danger?'danger':'primary'}" id="confirm-ok">${esc(okLabel)}</button></div>`,
    {onMount:b=>{$('#confirm-ok',b).onclick=()=>{closeSheet();onOk();};}});
}

/* ------------------------------------------------------------------
   13. SHEET + TOAST
   ------------------------------------------------------------------ */
let sheetGen=0, sheetCtx=null, lastFocus=null;
function openSheet(html,opts={}){
  sheetGen++; const s=$('#sheet'); sheetCtx=opts.ctx||null; $('#sheet-body').innerHTML=html;
  if(s.hidden){lastFocus=document.activeElement; s.hidden=false; void s.offsetWidth;}
  s.classList.add('open'); $('#sheet-panel').scrollTop=0; if(opts.onMount) opts.onMount($('#sheet-body'));
  setTimeout(()=>{try{$('#sheet-panel').focus({preventScroll:true});}catch(e){}},30);
}
function closeSheet(){
  const g=++sheetGen, s=$('#sheet'); s.classList.remove('open'); sheetCtx=null;
  setTimeout(()=>{if(g!==sheetGen) return; s.hidden=true; $('#sheet-body').innerHTML=''; if(lastFocus&&lastFocus.focus&&document.contains(lastFocus)) try{lastFocus.focus({preventScroll:true});}catch(e){}},reduced()?0:220);
}
let toastT;
function toast(msg){const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),1800);}

/* ------------------------------------------------------------------
   14. NAV + RENDER + EVENTS
   ------------------------------------------------------------------ */
function setTab(t){state.tab=t; save(); $$('.view').forEach(v=>v.hidden=v.id!=='view-'+t);
  $$('.tab').forEach(b=>{if(b.dataset.tab===t) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');});
  renderView(t); $('#main').scrollTop=0;}
function renderView(t){({swipe:renderSwipe,plan:renderPlan,list:renderList,recipes:renderRecipes})[t]();}
function renderNav(){
  const W=state.week, n=W.picks.length, bp=$('#badge-plan'), bl=$('#badge-list');
  bp.hidden=!n; bp.textContent=n;
  const left=n?buildList().buy.filter(x=>!W.got[x.id]).length:0; bl.hidden=!left; bl.textContent=left;
  $('#week-label').textContent=weekLabel()+' · '+state.settings.servings+(state.settings.servings===1?' person':' people');
}
function renderAll(){renderNav(); renderView(state.tab); if(sheetCtx&&sheetCtx.redraw) sheetCtx.redraw();}

document.addEventListener('click',e=>{
  const tabBtn=e.target.closest('[data-tab]');
  const el=e.target.closest('[data-act]');
  if(el){
    const a=el.dataset.act, id=el.dataset.id;
    switch(a){
      case 'close': closeSheet(); break;
      case 'settings': settingsSheet(); break;
      case 'type': {const t=el.dataset.type, f=state.filters; if(!t) f.types=[]; else f.types=f.types.includes(t)?f.types.filter(x=>x!==t):f.types.concat(t); save(); renderSwipe(); break;}
      case 'filters': filterSheet(); break;
      case 'fset': {state.filters[el.dataset.k]=parseFloat(el.dataset.v); save(); renderAll(); break;}
      case 'fmulti': {const k=el.dataset.k, v=el.dataset.v, a=state.filters[k]; state.filters[k]=a.includes(v)?a.filter(x=>x!==v):a.concat(v); save(); renderAll(); break;}
      case 'clearfilters': state.filters=emptyFilters(); state.useUp.mode='first'; save(); renderAll(); break;
      case 'useup': useUpSheet(); break;
      case 'fvary': state.filters.varyCarbs=!state.filters.varyCarbs; save(); renderAll(); break;
      case 'useing': {const u=state.useUp; u.ids=u.ids.includes(id)?u.ids.filter(x=>x!==id):u.ids.concat(id); save(); renderAll(); break;}
      case 'usemode': state.useUp.mode=el.dataset.v; save(); renderAll(); break;
      case 'useclear': state.useUp={ids:[],mode:'first'}; save(); renderAll(); break;
      case 'reshow': {const W=state.week; for(const k in W.decided) if(W.decided[k]==='L') delete W.decided[k]; W.history=W.history.filter(x=>W.decided[x]); save(); renderSwipe(); break;}
      case 'skip': decide('L'); break;
      case 'pick': decide('R'); break;
      case 'undo': undo(); break;
      case 'info': {const c=$('#deck .card.top'); if(c) openRecipe(c.dataset.id,'deck'); break;}
      case 'open': openRecipe(id,state.tab); break;
      case 'dserv': {const ctx=sheetCtx; if(!ctx) break; const p=getPick(ctx.id); const d=+el.dataset.d; if(p){p.servings=clamp(p.servings+d,1,12); save(); renderAll();} else {detailServings=clamp(detailServings+d,1,12); ctx.redraw();} break;}
      case 'dpick': case 'dskip': {const ctx=sheetCtx; closeSheet(); const top=$('#deck .card.top'); const dir=a==='dpick'?'R':'L';
        if(top&&ctx&&top.dataset.id===ctx.id) setTimeout(()=>decide(dir),reduced()?0:200); else if(ctx) applyDecision(ctx.id,dir); break;}
      case 'addpick': addPick(id); break;
      case 'unpick': unpick(id); break;
      case 'serv': setServings(id,+el.dataset.d); break;
      case 'newweek': confirmSheet('Start a new week?','This clears your picks, swipes and shopping ticks. Your recipes, prices and settings stay.','Start new week',()=>{state.week=freshWeek(); save(); setTab('swipe'); renderNav(); toast('New week started');}); break;
      case 'got': {const W=state.week; if(W.got[id]) delete W.got[id]; else W.got[id]=true; save(); renderList(); renderNav(); break;}
      case 'staple': {const W=state.week; if(W.needStaple[id]) delete W.needStaple[id]; else W.needStaple[id]=true; save(); renderList(); break;}
      case 'have': state.week.have[id]=true; save(); renderAll(); toast('Moved to Already have'); break;
      case 'unhave': delete state.week.have[id]; save(); renderAll(); break;
      case 'item': itemSheet(id); break;
      case 'copylist': copyText(listText(),'copy-fallback'); break;
      case 'sharelist': navigator.share({title:'Shopping list',text:listText()}).catch(()=>{}); break;
      case 'rectype': recType=el.dataset.type; renderRecipes(); break;
      case 'addrecipe': recipeForm(); break;
      case 'editrecipe': recipeForm(id); break;
      case 'delrecipe': deleteRecipe(id); break;
      case 'exportone': {const code=exportCode(id); $('#sheet-body').insertAdjacentHTML('beforeend','<textarea id="one-code" class="inp code" hidden readonly aria-label="Recipe code"></textarea>'); copyText(code,'one-code'); break;}
      case 'importexport': importExportSheet(); break;
      case 'rmphoto': delete myPhotos[id]; savePhotos(); renderAll(); toast('Photo removed'); break;
      case 'addrow': $('#rf-rows').insertAdjacentHTML('beforeend',ingRowHtml()); $('#rf-rows').lastElementChild.querySelector('.ir-name').focus(); break;
      case 'rmrow': {const row=el.closest('[data-row]'); if(row) row.remove(); break;}
      case 'set': {const k=el.dataset.k, s=state.settings; s[k]=clamp(s[k]+(+el.dataset.d),1,k==='dinners'?14:12); save(); const sp=$('#set-'+k); if(sp) sp.textContent=s[k]; renderNav(); renderView(state.tab); break;}
      case 'applyservings': state.week.picks.forEach(p=>p.servings=state.settings.servings); save(); renderAll(); toast('Updated every dinner'); break;
      case 'resetprices': confirmSheet('Reset all prices?','Every price you changed goes back to the built-in estimate.','Reset prices',()=>{state.prices={}; save(); renderAll(); toast('Prices reset');}); break;
      case 'wipe': confirmSheet('Delete all your data?','Your recipes, picks, prices and settings will be removed from this browser. This cannot be undone. Copy a backup code first if you want to keep your recipes.','Delete everything',()=>{try{localStorage.removeItem(KEY);localStorage.removeItem(PKEY);}catch(e){} state=defaults(); myPhotos={}; setTab('swipe'); renderNav(); toast('All data deleted');},true); break;
    }
    if(el.dataset.close&&a!=='close') closeSheet();
  }
  if(tabBtn){ if(el&&el.dataset.act==='close'){} setTab(tabBtn.dataset.tab); }
});
document.addEventListener('change',async e=>{
  const inp=e.target.closest&&e.target.closest('input[data-photo-for]'); if(!inp||!inp.files||!inp.files[0]) return;
  if(await setMyPhoto(inp.dataset.photoFor,inp.files[0])){renderAll(); toast('Photo saved');}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#sheet').hidden){closeSheet();return;}
  if($('#sheet').hidden&&state.tab==='swipe'&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){
    if(e.key==='ArrowRight'){e.preventDefault();decide('R');} else if(e.key==='ArrowLeft'){e.preventDefault();decide('L');}
  }
});

/* Boot */
if(!['swipe','plan','list','recipes'].includes(state.tab)) state.tab='swipe';
renderNav(); setTab(state.tab);
})();

