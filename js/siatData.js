/**
 * HALOS v2.0 - SIAT (Salt Intake Assessment Tool) Definitions
 * Standardized protocol for University of Peradeniya research cohort.
 * Supports Trilingual Rendering: English (en), Sinhala (si), Tamil (ta).
 */

(function() {
  const SIAT_I18N = {
    // -------------------------------------------------------------
    // SECTION B: GENERAL SALT ADDITION & COOKING PRACTICES
    // -------------------------------------------------------------
    sectionB: [
      {
        id: 'B1',
        title: {
          en: 'B1. How often do you add salt to your food at the table (after food is served)?',
          si: 'B1. ආහාර පිළිගැන්වීමෙන් පසු කෑම මේසයේදී ඔබ කොපමණ නිතර ලුණු එකතු කරනවාද?',
          ta: 'B1. உணவு பரிமாறப்பட்ட பிறகு மேசையில் உங்கள் உணவில் எவ்வளவு அடிக்கடி உப்பு சேர்க்கிறீர்கள்?'
        },
        type: 'likert',
        options: [
          { val: 'Never', labels: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' } },
          { val: 'Rarely', labels: { en: 'Rarely', si: 'කලාතුරකින්', ta: 'அரிதாக' } },
          { val: 'Sometimes', labels: { en: 'Sometimes', si: 'සමහර විට', ta: 'சில நேரங்களில்' } },
          { val: 'Often', labels: { en: 'Often', si: 'බොහෝ විට', ta: 'அடிக்கடி' } },
          { val: 'Always', labels: { en: 'Always', si: 'සෑම විටම', ta: 'எப்போதும்' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } }
        ]
      },
      {
        id: 'B2',
        title: {
          en: 'B2. How often is salt added during cooking or food preparation in your household?',
          si: 'B2. ඔබේ නිවසේ ආහාර පිසීමේදී හෝ සකස් කිරීමේදී කොපමණ නිතර ලුණු එකතු කරන්නේද?',
          ta: 'B2. உங்கள் வீட்டில் சமையல் அல்லது உணவு தயாரிப்பின் போது எவ்வளவு அடிக்கடி உப்பு சேர்க்கப்படுகிறது?'
        },
        type: 'likert',
        options: [
          { val: 'Never', labels: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' } },
          { val: 'Rarely', labels: { en: 'Rarely', si: 'කලාතුරකින්', ta: 'அரிதாக' } },
          { val: 'Sometimes', labels: { en: 'Sometimes', si: 'සමහර විට', ta: 'சில நேரங்களில்' } },
          { val: 'Often', labels: { en: 'Often', si: 'බොහෝ විට', ta: 'அடிக்கடி' } },
          { val: 'Always', labels: { en: 'Always', si: 'සෑම විටම', ta: 'எப்போதும்' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } }
        ]
      },
      {
        id: 'B3',
        title: {
          en: 'B3. What type of salt is most commonly used when cooking at home?',
          si: 'B3. නිවසේ ආහාර පිසීමේදී බහුලවම භාවිතා කරන ලුණු වර්ගය කුමක්ද?',
          ta: 'B3. வீட்டில் சமைக்கும் போது பொதுவாகப் பயன்படுத்தப்படும் உப்பு வகை எது?'
        },
        type: 'select',
        options: [
          { val: 'Crystal salt (keta lunu)', labels: { en: 'Crystal salt (keta lunu)', si: 'කැට ලුණු (Crystal salt)', ta: 'கல் உப்பு (கெட்ட லுணு)' } },
          { val: 'Table salt / Fine vacuum-dried salt (kudu lunu)', labels: { en: 'Table salt / Fine vacuum-dried salt (kudu lunu)', si: 'කුඩු ලුණු / මේස ලුණු (Table salt)', ta: 'தூள் உப்பு / மேசை உப்பு (குடு லுணு)' } },
          { val: 'Low-sodium / Potassium-enriched salt', labels: { en: 'Low-sodium / Potassium-enriched salt', si: 'අඩු සෝඩියම් / පොටෑසියම් බහුල ලුණු', ta: 'குறைந்த சோடியம் / பொட்டாசியம் செறிந்த உப்பு' } },
          { val: 'Sea salt or rock salt', labels: { en: 'Sea salt or rock salt', si: 'මුහුදු ලුණු හෝ පාෂාණ ලුණු', ta: 'கடல் உப்பு அல்லது பாறை உப்பு' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } },
          { val: 'Salt is not added', labels: { en: 'Salt is not added', si: 'ලුණු එකතු නොකරයි', ta: 'உப்பு சேர்ப்பதில்லை' } }
        ]
      },
      {
        id: 'B4',
        title: {
          en: 'B4. When cooking rice at home, is salt added to the cooking water?',
          si: 'B4. නිවසේ බත් පිසීමේදී වතුරට ලුණු එකතු කරනවාද?',
          ta: 'B4. வீட்டில் சோறு சமைக்கும் போது சமையல் நீரில் உப்பு சேர்க்கப்படுகிறதா?'
        },
        type: 'likert',
        options: [
          { val: 'Never', labels: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' } },
          { val: 'Rarely', labels: { en: 'Rarely', si: 'කලාතුරකින්', ta: 'அரிதாக' } },
          { val: 'Sometimes', labels: { en: 'Sometimes', si: 'සමහර විට', ta: 'சில நேரங்களில்' } },
          { val: 'Often', labels: { en: 'Often', si: 'බොහෝ විට', ta: 'அடிக்கடி' } },
          { val: 'Always', labels: { en: 'Always', si: 'සෑම විටම', ta: 'எப்போதும்' } },
          { val: "Don't cook/eat rice at home", labels: { en: "Don't cook/eat rice at home", si: 'නිවසේ බත් නොපිසී/නොකයි', ta: 'வீட்டில் சோறு சமைப்பதில்லை/உண்பதில்லை' } }
        ]
      },
      {
        id: 'B5',
        title: {
          en: 'B5. When cooking dhal (lentil) curry, is salt added during preparation?',
          si: 'B5. පරිප්පු ව්‍යංජනය පිසීමේදී ලුණු එකතු කරන්නේද?',
          ta: 'B5. பருப்பு கறி சமைக்கும் போது தயாரிப்பில் உப்பு சேர்க்கப்படுகிறதா?'
        },
        type: 'likert',
        options: [
          { val: 'Never', labels: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' } },
          { val: 'Rarely', labels: { en: 'Rarely', si: 'කලාතුරකින්', ta: 'அரிதாக' } },
          { val: 'Sometimes', labels: { en: 'Sometimes', si: 'සමහර විට', ta: 'சில நேரங்களில்' } },
          { val: 'Often', labels: { en: 'Often', si: 'බොහෝ විට', ta: 'அடிக்கடி' } },
          { val: 'Always', labels: { en: 'Always', si: 'සෑම විටම', ta: 'எப்போதும்' } },
          { val: "Don't consume dhal", labels: { en: "Don't consume dhal", si: 'පරිප්පු ආහාරයට නොගනී', ta: 'பருப்பு உட்கொள்வதில்லை' } }
        ]
      },
      {
        id: 'B6',
        title: {
          en: 'B6. Main meals eaten per week prepared outside home (canteen, kade, restaurant):',
          si: 'B6. නිවසින් පිටත සකස් කළ (කැන්ටින්, කඩ, අවන්හල්) ප්‍රධාන ආහාර වේල් සතියකට කීයක් ගන්නවාද?:',
          ta: 'B6. வீட்டிற்கு வெளியே தயாரிக்கப்பட்ட (உணவகம், ஹோட்டல்) பிரதான உணவுகள் வாரத்திற்கு எத்தனை முறை உட்கொள்கிறீர்கள்?:'
        },
        type: 'number',
        min: 0,
        max: 21,
        default: 5,
        unit: { en: 'meals / week', si: 'වේල් / සතියකට', ta: 'உணவுகள் / வாரம்' }
      },
      {
        id: 'B7',
        title: {
          en: 'B7. On an average day, how many cups / glasses of plain water do you drink?',
          si: 'B7. සාමාන්‍ය දිනකදී ඔබ සාමාන්‍ය පානීය ජලය කෝප්ප / වීදුරු කීයක් පානය කරනවාද?:',
          ta: 'B7. ஒரு சராசரி நாளில் நீங்கள் எத்தனை டம்ளர் சாதாரண தண்ணீர் குடிக்கிறீர்கள்?:'
        },
        type: 'number',
        min: 1,
        max: 30,
        default: 8,
        unit: { en: 'glasses / day', si: 'වීදුරු / දිනකට', ta: 'டம்ளர்கள் / நாள்' }
      }
    ],

    // Frequency scale options for Section C
    freqScale: [
      { value: 0, labels: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' } },
      { value: 1, labels: { en: '<1/mo', si: 'මසකට <1', ta: 'மாதத்திற்கு <1' } },
      { value: 2, labels: { en: '1-3/mo', si: 'මසකට 1-3', ta: 'மாதத்திற்கு 1-3' } },
      { value: 3, labels: { en: '1/wk', si: 'සතියකට 1', ta: 'வாரத்திற்கு 1' } },
      { value: 4, labels: { en: '2-4/wk', si: 'සතියකට 2-4', ta: 'வாரத்திற்கு 2-4' } },
      { value: 5, labels: { en: '5-6/wk', si: 'සතියකට 5-6', ta: 'வாரத்திற்கு 5-6' } },
      { value: 6, labels: { en: 'Daily', si: 'දිනපතා', ta: 'தினமும்' } },
      { value: 7, labels: { en: '>1/day', si: 'දිනකට >1', ta: 'நாளுக்கு >1' } }
    ],

    // Section C: High-Salt Food Groups
    sectionC: [
      {
        groupId: 'C1',
        groupTitle: {
          en: 'C1. Salted and Preserved Fish & Seafood',
          si: 'C1. ලුණු දැමූ සහ කල් තබා ගත් මාළු හා මුහුදු ආහාර',
          ta: 'C1. உப்பு மற்றும் பதப்படுத்தப்பட்ட மீன் மற்றும் கடல் உணவுகள்'
        },
        items: [
          {
            key: 'C1_1',
            name: {
              en: 'Dried fish (Karawala - kattawa, balaya, mora, etc.)',
              si: 'කරවල (කට්‍ටවා, බලයා, මෝරා, තලපත් ආදී)',
              ta: 'கருவாடு (கட்டவா, பலையா, சுறா, தலபத் போன்றவை)'
            },
            stdPortion: {
              en: '1 small-medium piece (~30g)',
              si: 'කුඩා-මධ්‍යම කැබැල්ලක් (~30g)',
              ta: '1 சிறிய-நடுத்தர துண்டு (~30g)'
            }
          },
          {
            key: 'C1_2',
            name: {
              en: 'Salted dried sprats (Halmasso / Nethili)',
              si: 'ලුණු දැමූ හාල්මැස්සන් (කරවල හාල්මැස්සන්)',
              ta: 'உப்பு நெத்திலி கருவாடு (நெத்திலி)'
            },
            stdPortion: {
              en: '1-2 tablespoons (~20g)',
              si: 'මේස හැඳි 1-2 (~20g)',
              ta: '1-2 மேசைக்கரண்டி (~20g)'
            }
          },
          {
            key: 'C1_3',
            name: {
              en: 'Maldive fish (Umbalakada) added to sambols/curries',
              si: 'උම්බලකඩ (සම්බෝල හෝ ව්‍යංජන සඳහා යොදන)',
              ta: 'மாசி கருவாடு (உம்பளக்கடை - சம்பல்/கறிகளில்)'
            },
            stdPortion: {
              en: '1 teaspoon (~5g)',
              si: 'තේ හැඳි 1 (~5g)',
              ta: '1 தேக்கரண்டி (~5g)'
            }
          },
          {
            key: 'C1_4',
            name: {
              en: 'Canned fish (Salmon / Mackerel in brine or oil)',
              si: 'ටින් මාළු (සැමන් / මැකරල්)',
              ta: 'டின் மீன் (சால்மன் / மெக்கரல்)'
            },
            stdPortion: {
              en: '1/2 can or 1-2 chunks (~75g)',
              si: 'ටින් 1/2ක් හෝ කැබලි 1-2ක් (~75g)',
              ta: '1/2 டின் அல்லது 1-2 துண்டுகள் (~75g)'
            }
          }
        ]
      },
      {
        groupId: 'C2',
        groupTitle: {
          en: 'C2. Processed Meat Products',
          si: 'C2. සැකසූ මස් නිෂ්පාදන',
          ta: 'C2. பதப்படுத்தப்பட்ட இறைச்சி பொருட்கள்'
        },
        items: [
          {
            key: 'C2_1',
            name: {
              en: 'Sausages (chicken, pork, beef)',
              si: 'සොසේජස් (කුකුළු, ඌරු, හරක් මස්)',
              ta: 'சாசேஜ்கள் (கோழி, பன்றி, மாட்டிறைச்சி)'
            },
            stdPortion: {
              en: '1-2 links (~60g)',
              si: 'කරල් 1-2ක් (~60g)',
              ta: '1-2 சாசேஜ்கள் (~60g)'
            }
          },
          {
            key: 'C2_2',
            name: {
              en: 'Meatballs (curried or fried)',
              si: 'මීට්බෝල්ස් (බැදපු හෝ කරි කළ මස් ගුලි)',
              ta: 'மீட்பால்ஸ் (பொரித்த அல்லது கறி வைத்த இறைச்சி உருண்டைகள்)'
            },
            stdPortion: {
              en: '3-4 pieces (~60g)',
              si: 'ගුලි 3-4ක් (~60g)',
              ta: '3-4 உருண்டைகள் (~60g)'
            }
          },
          {
            key: 'C2_3',
            name: {
              en: 'Ham, bacon, or luncheon meat',
              si: 'හැම්, බේකන් හෝ ලන්චන් මීට්',
              ta: 'ஹாம், பேக்கன் அல்லது லஞ்சன் மீட்'
            },
            stdPortion: {
              en: '1-2 slices (~40g)',
              si: 'පෙති 1-2ක් (~40g)',
              ta: '1-2 துண்டுகள் (~40g)'
            }
          }
        ]
      },
      {
        groupId: 'C3',
        groupTitle: {
          en: 'C3. Traditional Condiments, Sambols & Pickles',
          si: 'C3. පාරම්පරික අච්චාරු, සම්බෝල සහ රසකාරක',
          ta: 'C3. பாரம்பரிய சம்பல், ஊறுகாய் மற்றும் சுவையூட்டிகள்'
        },
        items: [
          {
            key: 'C3_1',
            name: {
              en: 'Lime pickle (Lunu dehi) or Malay/Sinhala achcharu',
              si: 'ලුණු දෙහි හෝ මැලේ/සිංහල අච්චාරු',
              ta: 'உப்பு எலுமிச்சை (லுணு தெஹி) அல்லது மலாய்/சிங்கள ஊறுகாய்'
            },
            stdPortion: {
              en: '1 piece or 1 tbsp (~15g)',
              si: 'කැබැල්ලක් හෝ මේස හැඳි 1 (~15g)',
              ta: '1 துண்டு அல்லது 1 மேசைக்கரண்டி (~15g)'
            }
          },
          {
            key: 'C3_2',
            name: {
              en: 'Lunu miris (onion, chilli, salt, lime grind)',
              si: 'ලුණු මිරිස් (ලූනු, මිරිස්, ලුණු, දෙහි)',
              ta: 'லுணு மிரிஸ் (வெங்காயம், மிளகாய், உப்பு, எலுமிச்சை)'
            },
            stdPortion: {
              en: '1 tablespoon (~20g)',
              si: 'මේස හැඳි 1 (~20g)',
              ta: '1 மேசைக்கரண்டி (~20g)'
            }
          },
          {
            key: 'C3_3',
            name: {
              en: 'Katta sambol or Seeni sambol',
              si: 'කට්ට සම්බෝල හෝ සීනි සම්බෝල',
              ta: 'கட்ட சம்பல் அல்லது சீனி சம்பல்'
            },
            stdPortion: {
              en: '1 tablespoon (~20g)',
              si: 'මේස හැඳි 1 (~20g)',
              ta: '1 மேசைக்கரண்டி (~20g)'
            }
          },
          {
            key: 'C3_4',
            name: {
              en: 'Mango / Ambarella chutney',
              si: 'අඹ හෝ ඇඹරැල්ලා චට්නි',
              ta: 'மாங்காய் அல்லது அம்பரல்லா சட்னி'
            },
            stdPortion: {
              en: '1 tablespoon (~20g)',
              si: 'මේස හැඳි 1 (~20g)',
              ta: '1 மேசைக்கரண்டி (~20g)'
            }
          }
        ]
      },
      {
        groupId: 'C4',
        groupTitle: {
          en: 'C4. Savoury Snacks, Crackers & Bites',
          si: 'C4. ලුණු රසැති කෙටි ආහාර, ක්‍රැකර් සහ බයිට්ස්',
          ta: 'C4. காரமான சிற்றுண்டிகள், கிராக்கர்ஸ் மற்றும் பைட்ஸ்'
        },
        items: [
          {
            key: 'C4_1',
            name: {
              en: 'Papadam (fried crispy lentil wafers)',
              si: 'පපඩම් (බැදපු)',
              ta: 'பப்படம் (பொரித்த அப்பளம்)'
            },
            stdPortion: {
              en: '2-3 discs (~15g)',
              si: 'පතුරු 2-3ක් (~15g)',
              ta: '2-3 வட்டங்கள் (~15g)'
            }
          },
          {
            key: 'C4_2',
            name: {
              en: 'Murukku, mixture, or fried savoury bites',
              si: 'මුරුක්කු, මික්ස්චර් හෝ බැදපු බයිට්ස්',
              ta: 'முறுக்கு, மிக்சர் அல்லது பொரித்த கார வகைகள்'
            },
            stdPortion: {
              en: '1 small packet / handful (~30g)',
              si: 'කුඩා පැකට් 1ක් / අතලොස්සක් (~30g)',
              ta: '1 சிறிய பாக்கெட் / ஒரு பிடி (~30g)'
            }
          },
          {
            key: 'C4_3',
            name: {
              en: 'Potato crisps / packaged chips',
              si: 'අල චිප්ස් / පැකට් කළ චිප්ස්',
              ta: 'உருளைக்கிழங்கு சிப்ஸ் / பாக்கெட் சிப்ஸ்'
            },
            stdPortion: {
              en: '1 small packet (~35g)',
              si: 'කුඩා පැකට් 1ක් (~35g)',
              ta: '1 சிறிய பாக்கெட் (~35g)'
            }
          },
          {
            key: 'C4_4',
            name: {
              en: 'Cream crackers / savoury biscuits',
              si: 'ක්‍රීම් ක්‍රැකර් / ලුණු බිස්කට්',
              ta: 'கிரீம் கிராக்கர்ஸ் / கார பிஸ்கட்டுகள்'
            },
            stdPortion: {
              en: '3-4 crackers (~40g)',
              si: 'බිස්කට් 3-4ක් (~40g)',
              ta: '3-4 பிஸ்கட்டுகள் (~40g)'
            }
          },
          {
            key: 'C4_5',
            name: {
              en: 'Salted roasted peanuts / fried kadala / green gram bites',
              si: 'ලුණු දැමූ රටකජු / බැදපු කඩල / මුං ඇට බයිට්ස්',
              ta: 'உப்பு வேர்க்கடலை / வறுத்த கடலை / பயறு வகைகள்'
            },
            stdPortion: {
              en: '1 handful (~30g)',
              si: 'අතලොස්සක් (~30g)',
              ta: 'ஒரு பிடி (~30g)'
            }
          }
        ]
      },
      {
        groupId: 'C5',
        groupTitle: {
          en: 'C5. Short Eats, Bakery Foods & Street Foods',
          si: 'C5. ෂෝර්ට් ඊට්ස්, බේකරි නිෂ්පාදන සහ වීදි ආහාර',
          ta: 'C5. ஷார்ட் ஈட்ஸ், பேக்கரி உணவுகள் மற்றும் தெரு உணவுகள்'
        },
        items: [
          {
            key: 'C5_1',
            name: {
              en: 'Short eats (fish/vegetable rolls, patties, samosas)',
              si: 'ෂෝර්ට් ඊට්ස් (රෝල්ස්, පැටිස්, සැමෝසා)',
              ta: 'ஷார்ட் ஈட்ஸ் (ரோல்ஸ், பட்டீஸ், சமோசா)'
            },
            stdPortion: {
              en: '1-2 items (~80g)',
              si: 'ගෙඩි 1-2ක් (~80g)',
              ta: '1-2 உருப்படிகள் (~80g)'
            }
          },
          {
            key: 'C5_2',
            name: {
              en: 'Vegetable roti, egg roti, or paratha',
              si: 'එළවළු රොටි, බිත්තර රොටි හෝ පරාටා',
              ta: 'மரக்கறி ரொட்டி, முட்டை ரொட்டி அல்லது பரோட்டா'
            },
            stdPortion: {
              en: '1 piece (~80g)',
              si: 'රොටි 1ක් (~80g)',
              ta: '1 ரொட்டி (~80g)'
            }
          },
          {
            key: 'C5_3',
            name: {
              en: 'Commercial bakery bread (sandwich loaf / roast paan)',
              si: 'බේකරි පාන් (සෑන්ඩ්විච් පාන් / රෝස්ට් පාන්)',
              ta: 'பேக்கரி பாண் (சான்ட்விச் பாண் / ரோஸ்ட் பாண்)'
            },
            stdPortion: {
              en: '2 slices (~60g)',
              si: 'පෙති 2ක් (~60g)',
              ta: '2 துண்டுகள் (~60g)'
            }
          }
        ]
      },
      {
        groupId: 'C6',
        groupTitle: {
          en: 'C6. Commercial Sauces & Seasonings',
          si: 'C6. වාණිජ සෝස් වර්ග සහ රසකාරක',
          ta: 'C6. வணிக சாஸ்கள் மற்றும் சுவையூட்டிகள்'
        },
        items: [
          {
            key: 'C6_1',
            name: {
              en: 'Soya sauce (added to food or used in cooking)',
              si: 'සෝයා සෝස් (ආහාරයට හෝ පිසීමට යොදන)',
              ta: 'சோயா சாஸ் (உணவில் அல்லது சமையலில் சேர்ப்பது)'
            },
            stdPortion: {
              en: '1 tablespoon (~15ml)',
              si: 'මේස හැඳි 1 (~15ml)',
              ta: '1 மேசைக்கரண்டி (~15ml)'
            }
          },
          {
            key: 'C6_2',
            name: {
              en: 'Tomato sauce or chilli sauce',
              si: 'තක්කාලි සෝස් හෝ මිරිස් සෝස්',
              ta: 'தக்காளி சாஸ் அல்லது மிளகாய் சாஸ்'
            },
            stdPortion: {
              en: '1 tablespoon (~15ml)',
              si: 'මේස හැඳි 1 (~15ml)',
              ta: '1 மேசைக்கரண்டி (~15ml)'
            }
          },
          {
            key: 'C6_3',
            name: {
              en: 'Chilli paste (Chinese/Sri Lankan style)',
              si: 'චිලි පේස්ට් (චයිනීස්/ශ්‍රී ලාංකික)',
              ta: 'மிளகாய் பேஸ்ட் (சைனீஸ்/இலங்கை முறை)'
            },
            stdPortion: {
              en: '1 teaspoon (~10g)',
              si: 'තේ හැඳි 1 (~10g)',
              ta: '1 தேக்கரண்டி (~10g)'
            }
          },
          {
            key: 'C6_4',
            name: {
              en: 'MSG (Ajinomoto) or seasoning cubes/powder (Maggi/Knorr)',
              si: 'අජිනමොටෝ (MSG) හෝ රස කැට/පවුඩර් (මැගී/නෝර්)',
              ta: 'அஜினோமோட்டோ (MSG) அல்லது சுவையூட்டும் கட்டிகள் (Maggi/Knorr)'
            },
            stdPortion: {
              en: '1 cube or 1/2 tsp',
              si: 'කැට 1ක් හෝ තේ හැඳි 1/2ක්',
              ta: '1 கட்டி அல்லது 1/2 தேக்கரண்டி'
            }
          }
        ]
      },
      {
        groupId: 'C7',
        groupTitle: {
          en: 'C7. Instant Foods & Fast Food',
          si: 'C7. ක්ෂණික ආහාර සහ ෆාස්ට් ෆුඩ්',
          ta: 'C7. உடனடி உணவுகள் மற்றும் துரித உணவுகள்'
        },
        items: [
          {
            key: 'C7_1',
            name: {
              en: 'Instant noodles prepared with seasoning flavour sachet',
              si: 'ක්ෂණික නූඩ්ල්ස් (රසකාරක පැකට්ටුව සමඟ සකස් කළ)',
              ta: 'உடனடி நூடுல்ஸ் (சுவையூட்டும் பாக்கெட் உடன்)'
            },
            stdPortion: {
              en: '1 packet (~75g dry)',
              si: 'පැකට් 1ක් (~75g)',
              ta: '1 பாக்கெட் (~75g)'
            }
          },
          {
            key: 'C7_2',
            name: {
              en: 'Kottu roti (vegetable, egg, chicken, beef)',
              si: 'කොත්තු රොටි (එළවළු, බිත්තර, කුකුළු මස්)',
              ta: 'கொத்து ரொட்டி (மரக்கறி, முட்டை, கோழி, மாட்டிறைச்சி)'
            },
            stdPortion: {
              en: '1 regular portion (~350g)',
              si: 'සාමාන්‍ය පංගුවක් (~350g)',
              ta: '1 சாதாரண அளவு (~350g)'
            }
          },
          {
            key: 'C7_3',
            name: {
              en: 'Commercial fried rice (restaurant/canteen style)',
              si: 'ෆ්‍රයිඩ් රයිස් (හෝටල් හෝ කැන්ටින් ක්‍රමයට)',
              ta: 'ஃபிரைடு ரைஸ் (உணவகம்/கேண்டீன் பாணி)'
            },
            stdPortion: {
              en: '1 packet / plate (~350g)',
              si: 'පැකට් 1ක් / පිඟානක් (~350g)',
              ta: '1 பாக்கெட் / தட்டு (~350g)'
            }
          },
          {
            key: 'C7_4',
            name: {
              en: 'Western-style fast food (fried chicken, burgers, fries)',
              si: 'බටහිර පන්නයේ ක්ෂණික ආහාර (ෆ්‍රයිඩ් චිකන්, බර්ගර්, ෆ්‍රයිස්)',
              ta: 'மேற்கத்திய துரித உணவுகள் (பொரித்த கோழி, பர்கர், பிரைஸ்)'
            },
            stdPortion: {
              en: '1 meal',
              si: 'ආහාර වේලක්',
              ta: '1 வேளை உணவு'
            }
          }
        ]
      },
      {
        groupId: 'C8',
        groupTitle: {
          en: 'C8. Dairy Products',
          si: 'C8. කිරි ආශ්‍රිත නිෂ්පාදන',
          ta: 'C8. பால் பொருட்கள்'
        },
        items: [
          {
            key: 'C8_1',
            name: {
              en: 'Processed cheese / cheese wedges / slices (Happy Cow, Kraft)',
              si: 'සැකසූ චීස් / චීස් කැබලි / පෙති (හැපි කව්, ක්‍රාෆ්ට්)',
              ta: 'பதப்படுத்தப்பட்ட பாலாடைக்கட்டி (சீஸ் துண்டுகள் - Happy Cow, Kraft)'
            },
            stdPortion: {
              en: '1-2 wedges or slices (~25g)',
              si: 'කැබලි හෝ පෙති 1-2ක් (~25g)',
              ta: '1-2 துண்டுகள் (~25g)'
            }
          },
          {
            key: 'C8_2',
            name: {
              en: 'Salted butter or salted table margarine',
              si: 'ලුණු දැමූ බටර් හෝ මේස මාජරින්',
              ta: 'உப்பு சேர்க்கப்பட்ட வெண்ணெய் அல்லது மாஜரின்'
            },
            stdPortion: {
              en: '1 pat or teaspoon (~10g)',
              si: 'තේ හැඳි 1ක් (~10g)',
              ta: '1 தேக்கரண்டி (~10g)'
            }
          }
        ]
      }
    ],

    // -------------------------------------------------------------
    // SECTION D: KNOWLEDGE, ATTITUDES & BEHAVIOURS
    // -------------------------------------------------------------
    sectionD: [
      {
        id: 'D1',
        title: {
          en: 'D1. In your opinion, do you think high salt intake can cause serious health problems?',
          si: 'D1. ඔබේ අදහස අනුව, වැඩිපුර ලුණු භාවිතය බරපතල සෞඛ්‍ය ගැටලු ඇති කළ හැකි යැයි ඔබ සිතනවාද?',
          ta: 'D1. உங்கள் கருத்தின்படி, அதிக உப்பு உட்கொள்வது தீவிர சுகாதாரப் பிரச்சினைகளை ஏற்படுத்தும் என்று நினைக்கிறீர்களா?'
        },
        type: 'radio',
        options: [
          { val: 'Yes', labels: { en: 'Yes', si: 'ඔව්', ta: 'ஆம்' } },
          { val: 'No', labels: { en: 'No', si: 'නැත', ta: 'இல்லை' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } }
        ]
      },
      {
        id: 'D2',
        title: {
          en: 'D2. Which health conditions do you think are linked to eating too much salt? (Select all that apply)',
          si: 'D2. වැඩිපුර ලුණු ආහාරයට ගැනීම නිසා ඇතිවිය හැකි සෞඛ්‍ය ගැටලු මොනවාදැයි ඔබ සිතන්නේ? (අදාළ සියල්ල තෝරන්න)',
          ta: 'D2. அதிக உப்பு சாப்பிடுவதால் ஏற்படும் சுகாதாரப் பிரச்சினைகள் எவை என்று நினைக்கிறீர்கள்? (பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்)'
        },
        type: 'multicheck',
        options: [
          { val: 'High blood pressure (Hypertension)', labels: { en: 'High blood pressure (Hypertension)', si: 'අධික රුධිර පීඩනය (හයිපර්ටෙන්ෂන්)', ta: 'உயர் இரத்த அழுத்தம் (Hypertension)' } },
          { val: 'Stroke', labels: { en: 'Stroke', si: 'ආඝාතය (ස්ට්‍රෝක්)', ta: 'பக்கவாதம் (Stroke)' } },
          { val: 'Heart disease / Heart attack', labels: { en: 'Heart disease / Heart attack', si: 'හෘද රෝග / හෘදයාබාධ', ta: 'இதய நோய் / மாரடைப்பு' } },
          { val: 'Kidney disease', labels: { en: 'Kidney disease', si: 'වකුගඩු රෝග', ta: 'சிறுநீரக நோய்' } },
          { val: 'Stomach cancer', labels: { en: 'Stomach cancer', si: 'ආමාශ පිළිකා', ta: 'வயிற்றுப் புற்றுநோய்' } },
          { val: 'Osteoporosis', labels: { en: 'Osteoporosis', si: 'ඔස්ටියෝපොරෝසිස් (අස්ථි දුර්වලවීම)', ta: 'எலும்புப்புரை நோய் (Osteoporosis)' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } }
        ]
      },
      {
        id: 'D3',
        title: {
          en: 'D3. How much salt do you think you consume compared to what is recommended for health?',
          si: 'D3. සෞඛ්‍යයට නිර්දේශිත ප්‍රමාණයට සාපේක්ෂව ඔබ කොපමණ ලුණු ප්‍රමාණයක් පරිභෝජනය කරනවා යැයි සිතනවාද?',
          ta: 'D3. ஆரோக்கியத்திற்குப் பரிந்துரைக்கப்பட்ட அளவோடு ஒப்பிடும்போது நீங்கள் எவ்வளவு உப்பு உட்கொள்கிறீர்கள் என்று நினைக்கிறீர்கள்?'
        },
        type: 'radio',
        options: [
          { val: 'Far too much', labels: { en: 'Far too much', si: 'බෙහෙවින් වැඩියි', ta: 'மிக அதிகம்' } },
          { val: 'Too much', labels: { en: 'Too much', si: 'වැඩියි', ta: 'அதிகம்' } },
          { val: 'Just the right amount', labels: { en: 'Just the right amount', si: 'නියමිත ප්‍රමාණය', ta: 'சரியான அளவு' } },
          { val: 'Too little', labels: { en: 'Too little', si: 'අඩුයි', ta: 'குறைவு' } },
          { val: 'Far too little', labels: { en: 'Far too little', si: 'බෙහෙවින් අඩුයි', ta: 'மிகக் குறைவு' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } }
        ]
      },
      {
        id: 'D4',
        title: {
          en: 'D4. How important to you is it to lower the amount of salt in your diet?',
          si: 'D4. ඔබේ ආහාරයේ ලුණු ප්‍රමාණය අඩු කිරීම ඔබට කෙතරම් වැදගත්ද?',
          ta: 'D4. உங்கள் உணவில் உப்பின் அளவைக் குறைப்பது உங்களுக்கு எவ்வளவு முக்கியம்?'
        },
        type: 'radio',
        options: [
          { val: 'Very important', labels: { en: 'Very important', si: 'ඉතා වැදගත්', ta: 'மிகவும் முக்கியம்' } },
          { val: 'Somewhat important', labels: { en: 'Somewhat important', si: 'තරමක් වැදගත්', ta: 'ஓரளவு முக்கியம்' } },
          { val: 'Not important', labels: { en: 'Not important', si: 'වැදගත් නොවේ', ta: 'முக்கியமில்லை' } },
          { val: "Don't know", labels: { en: "Don't know", si: 'නොදනී', ta: 'தெரியாது' } }
        ]
      },
      {
        id: 'D5',
        title: {
          en: 'D5. Which actions do you regularly take to control or reduce your salt intake? (Select all that apply)',
          si: 'D5. ලුණු භාවිතය පාලනය කිරීමට හෝ අඩු කිරීමට ඔබ නිතිපතා ගන්නා ක්‍රියාමාර්ග මොනවාද? (අදාළ සියල්ල තෝරන්න)',
          ta: 'D5. உப்பு உட்கொள்ளலைக் கட்டுப்படுத்த அல்லது குறைக்க நீங்கள் வழக்கமாக எடுக்கும் நடவடிக்கைகள் எவை? (பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்)'
        },
        type: 'multicheck',
        options: [
          { val: 'Avoid eating processed or packaged foods', labels: { en: 'Avoid eating processed or packaged foods', si: 'සැකසූ හෝ පැකට් කළ ආහාර ගැනීමෙන් වැළකීම', ta: 'பதப்படுத்தப்பட்ட அல்லது பொதி செய்யப்பட்ட உணவுகளைத் தவிர்த்தல்' } },
          { val: 'Look at salt/sodium labels on food packages', labels: { en: 'Look at salt/sodium labels on food packages', si: 'ආහාර පැකට්වල ලුණු/සෝඩියම් ලේබල පරීක්ෂා කිරීම', ta: 'உணவுப் பொதிகளில் உப்பு/சோடியம் லேபிள்களைப் பார்த்தல்' } },
          { val: 'Buy low-salt or reduced-sodium alternatives', labels: { en: 'Buy low-salt or reduced-sodium alternatives', si: 'අඩු ලුණු හෝ අඩු සෝඩියම් ආදේශක මිලදී ගැනීම', ta: 'குறைந்த உப்பு மாற்றீடுகளை வாங்குதல்' } },
          { val: 'Do not add salt to food at the table', labels: { en: 'Do not add salt to food at the table', si: 'කෑම මේසයේදී ආහාරවලට ලුණු එකතු නොකිරීම', ta: 'சாப்பாட்டு மேசையில் உணவில் உப்பு சேர்க்காதிருத்தல்' } },
          { val: 'Cook at home with less salt or no salt', labels: { en: 'Cook at home with less salt or no salt', si: 'නිවසේදී අඩු ලුණුවලින් හෝ ලුණු රහිතව පිසීම', ta: 'வீட்டில் குறைந்த உப்புடன் அல்லது உப்பின்றி சமைத்தல்' } },
          { val: 'Use spices, lemon juice, or vinegar instead of salt', labels: { en: 'Use spices, lemon juice, or vinegar instead of salt', si: 'ලුණු වෙනුවට කුළුබඩු, දෙහි යුෂ හෝ විනාකිරි භාවිතය', ta: 'உப்புக்குப் பதிலாக மசாலா, எலுமிச்சை சாறு அல்லது வினிகர் பயன்படுத்துதல்' } },
          { val: 'Avoid eating out at canteens, restaurants, or street stalls', labels: { en: 'Avoid eating out at canteens, restaurants, or street stalls', si: 'ආපනශාලා හෝ කඩවලින් පිටත ආහාර ගැනීමෙන් වැළකීම', ta: 'உணவகங்கள் அல்லது தெருவோரக் கடைகளில் சாப்பிடுவதைத் தவிர்த்தல்' } },
          { val: 'Avoid adding salt when cooking rice', labels: { en: 'Avoid adding salt when cooking rice', si: 'බත් පිසීමේදී ලුණු එකතු නොකිරීම', ta: 'சோறு சமைக்கும் போது உப்பு சேர்க்காதிருத்தல்' } },
          { val: 'Rinse or soak dried fish/sprats before cooking', labels: { en: 'Rinse or soak dried fish/sprats before cooking', si: 'කරවල/හාල්මැස්සන් පිසීමට පෙර සේදීම හෝ පෙඟවීම', ta: 'கருவாடு/நெத்திலியை சமைப்பதற்கு முன் கழுவுதல் அல்லது ஊறவைத்தல்' } },
          { val: 'None of the above', labels: { en: 'None of the above', si: 'ඉහත කිසිවක් නොවේ', ta: 'மேலே உள்ள எதுவுமில்லை' } }
        ]
      },
      {
        id: 'D6',
        title: {
          en: 'D6. How often do you check food labels for salt or sodium content when purchasing packaged foods?',
          si: 'D6. පැකට් කළ ආහාර මිලදී ගැනීමේදී ලුණු හෝ සෝඩියම් ප්‍රමාණය සඳහා ආහාර ලේබල කොපමණ නිතර පරීක්ෂා කරනවාද?',
          ta: 'D6. பொதி செய்யப்பட்ட உணவுகளை வாங்கும் போது உப்பு அல்லது சோடியம் உள்ளடக்கத்திற்கான உணவு லேபிள்களை எவ்வளவு அடிக்கடி சரிபார்க்கிறீர்கள்?'
        },
        type: 'likert',
        options: [
          { val: 'Never', labels: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' } },
          { val: 'Rarely', labels: { en: 'Rarely', si: 'කලාතුරකින්', ta: 'அரிதாக' } },
          { val: 'Sometimes', labels: { en: 'Sometimes', si: 'සමහර විට', ta: 'சில நேரங்களில்' } },
          { val: 'Often', labels: { en: 'Often', si: 'බොහෝ විට', ta: 'அடிக்கடி' } },
          { val: 'Always', labels: { en: 'Always', si: 'සෑම විටම', ta: 'எப்போதும்' } },
          { val: "I don't buy packaged foods", labels: { en: "I don't buy packaged foods", si: 'මම පැකට් කළ ආහාර මිලදී නොගනිමි', ta: 'நான் பொதி செய்யப்பட்ட உணவுகளை வாங்குவதில்லை' } }
        ]
      },
      {
        id: 'D7',
        title: {
          en: 'D7. Do you know what the WHO recommended maximum daily salt intake is for an adult?',
          si: 'D7. වැඩිහිටියෙකු සඳහා ලෝක සෞඛ්‍ය සංවිධානය (WHO) නිර්දේශිත උපරිම දෛනික ලුණු ප්‍රමාණය ඔබ දන්නවාද?',
          ta: 'D7. ஒரு பெரியவருக்கு உலக சுகாதார நிறுவனம் (WHO) பரிந்துரைக்கும் அதிகபட்ச தினசரி உப்பு உட்கொள்ளல் என்னவென்று உங்களுக்குத் தெரியுமா?'
        },
        type: 'radio',
        options: [
          { val: 'Yes, 5 grams (approx. 1 level teaspoon)', labels: { en: 'Yes, 5 grams (approx. 1 level teaspoon)', si: 'ඔව්, ග්‍රෑම් 5 (ආසන්න වශයෙන් තේ හැඳි 1)', ta: 'ஆம், 5 கிராம் (தோராயமாக 1 மட்டமான தேக்கரண்டி)' } },
          { val: 'Yes, but not sure of exact amount', labels: { en: 'Yes, but not sure of exact amount', si: 'ඔව්, නමුත් නිශ්චිත ප්‍රමාණය ස්ථිර නැත', ta: 'ஆம், ஆனால் சரியான அளவு உறுதியாகத் தெரியவில்லை' } },
          { val: "No, I don't know", labels: { en: "No, I don't know", si: 'නැත, මම නොදනිමි', ta: 'இல்லை, எனக்குத் தெரியாது' } }
        ]
      }
    ]
  };

  // Build the HALOS_SIAT object
  window.HALOS_SIAT = {
    // Current or specified language resolution
    getLang() {
      return (window.HALOS_I18N ? window.HALOS_I18N.getLanguage() : 'en') || 'en';
    },

    get sectionB() {
      const lang = this.getLang();
      return SIAT_I18N.sectionB.map(q => ({
        id: q.id,
        title: q.title[lang] || q.title.en,
        type: q.type,
        min: q.min,
        max: q.max,
        default: q.default,
        unit: q.unit ? (q.unit[lang] || q.unit.en) : '',
        options: q.options ? q.options.map(opt => ({
          value: opt.val,
          label: opt.labels[lang] || opt.labels.en
        })) : []
      }));
    },

    get freqScale() {
      const lang = this.getLang();
      return SIAT_I18N.freqScale.map(scale => ({
        value: scale.value,
        label: scale.labels[lang] || scale.labels.en
      }));
    },

    get sectionC() {
      const lang = this.getLang();
      return SIAT_I18N.sectionC.map(group => ({
        groupId: group.groupId,
        groupTitle: group.groupTitle[lang] || group.groupTitle.en,
        items: group.items.map(item => ({
          key: item.key,
          name: item.name[lang] || item.name.en,
          stdPortion: item.stdPortion[lang] || item.stdPortion.en
        }))
      }));
    },

    get sectionD() {
      const lang = this.getLang();
      return SIAT_I18N.sectionD.map(q => ({
        id: q.id,
        title: q.title[lang] || q.title.en,
        type: q.type,
        options: q.options.map(opt => ({
          value: opt.val,
          label: opt.labels[lang] || opt.labels.en
        }))
      }));
    }
  };
})();
