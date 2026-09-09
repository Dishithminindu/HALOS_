/**
 * HALOS v2.0 - Internationalization (i18n) Engine
 * Full Trilingual Support: English (en), Sinhala (si / සිංහල), Tamil (ta / தமிழ்)
 * Standardized for University of Peradeniya scientific cohort research.
 */

(function() {
  const STORAGE_KEY = 'halos_language';
  const SUPPORTED_LANGS = ['en', 'si', 'ta'];

  // Global Translations Dictionary
  const TRANSLATIONS = {
    // -------------------------------------------------------------
    // COMMON & NAVIGATION
    // -------------------------------------------------------------
    en: {
      appName: 'HALOS Protocol',
      appSub: 'University of Peradeniya • Faculty of Medicine',
      navDashboard: 'Dashboard Overview',
      navAssessment: '1. Participant Screening',
      navRecall: '2. 24-Hour Dietary Recall',
      navMonthly: '3. Food Frequency & Salt (SIAT)',
      navResults: '4. AI Salt Assessment',
      navPatients: 'Participant Registry',
      navResearch: 'Research Analytics',
      navAbout: 'Methodology & Protocol',
      navLogin: 'Investigator Portal',
      step1: 'Registration',
      step2: '24-hr Recall',
      step3: 'Food Frequency',
      step4: 'Salt AI Assessment',
      btnSave: 'Save & Continue',
      btnCancel: 'Cancel',
      btnReset: 'Reset',
      btnBack: 'Back',
      btnProceed: 'Proceed',
      activeParticipant: 'Participant',
      previewMode: 'Preview Mode (Unconsented)',
      eligible: 'Eligible',
      ineligible: 'Ineligible',
      whoTarget: 'WHO Daily Target: ≤ 5.0 g/day',
      sec0Title: 'Section 0: Screening and Eligibility Criteria',
      sec0Desc: 'Verify participant eligibility before administering dietary assessments.',
      secATitle: 'Section A: Sociodemographic Characteristics',
      secADesc: 'Institutional demographics and baseline cardiovascular health indicators.',
      secBTitle: 'Section B: General Salt Addition & Cooking Practices',
      secBDesc: 'Household culinary practices, dining out frequency, and daily water consumption.',
      secCTitle: 'Section C: Food Frequency Matrix of High-Salt Foods (Past 30 Days)',
      secCDesc: 'Report typical consumption frequency and portion size across 8 high-sodium food categories.',
      secDTitle: 'Section D: Knowledge, Attitudes & Behaviour (KAB) Regarding Dietary Salt',
      secDDesc: 'Awareness of sodium-related cardiovascular risks, personal salt perception, and dietary reduction actions.',

      // Section 0 Questions
      q0_1: '0.1 Are you 18 years of age or older?',
      q0_1_yes: 'Yes (Eligible)',
      q0_1_no: 'No (Under 18 — Ineligible)',
      q0_2_title: '0.2 Exclusion Criteria Checklist',
      q0_2_subtitle: 'Please check any condition that currently applies. If any box is checked, participant is excluded under ethical protocol.',
      excl_pregnant: 'Currently pregnant or breastfeeding',
      excl_low_salt: 'Following a medically prescribed low-sodium/salt diet',
      excl_therapeutic: 'Following any other prescribed therapeutic diet (e.g. renal diet, strict diabetes meal plan)',
      excl_tube: 'Receiving tube or enteral feeding',
      excl_swallow: 'Difficulty swallowing or any medical condition preventing eating ordinary foods',
      excl_illness: 'An illness in the past week that temporarily changed what is normally eaten',
      q0_3: '0.3 Are you currently affiliated with the University of Peradeniya as either staff or a registered student?',
      q0_3_yes: 'Yes (Staff or Student)',
      q0_3_no: 'No',
      q0_4: '0.4 Are you able to understand and complete questions in Sinhala, Tamil or English?',
      q0_4_yes: 'Yes',
      q0_4_no: 'No',
      q0_5: '0.5 Written informed consent obtained?',
      q0_5_yes: 'Yes (Signed / Digital Consent Confirmed)',
      q0_5_no: 'No (Cannot proceed without consent)',
      q0_6: '0.6 Willing and able to complete two 24-hour dietary recalls on separate days if selected for the criterion-validation subsample?',
      q0_6_yes: 'Yes, willing',
      q0_6_no: 'No',
      q0_6_not_selected: 'Not selected for validation subsample',

      // Section A Questions
      qA1: 'A1. Age (completed years)',
      qA1_hint: 'Must be 18–120 years.',
      qA2: 'A2. Sex',
      qA2_male: 'Male',
      qA2_female: 'Female',
      qA3: 'A3. Status at University of Peradeniya',
      qA3_academic: 'Academic staff',
      qA3_non_academic: 'Non-academic staff',
      qA3_undergrad: 'Undergraduate student',
      qA3_postgrad: 'Postgraduate student',
      qA4: 'A4. Faculty or Division',
      qA5: 'A5. Highest Level of Education Completed',
      qA5_ol: 'Up to G.C.E. Ordinary Level (O/L)',
      qA5_al: 'G.C.E. Advanced Level (A/L)',
      qA5_diploma: 'Diploma or equivalent vocational certificate',
      qA5_degree: "Bachelor's degree",
      qA5_postgrad: "Postgraduate degree (Master's / MPhil / PhD / MD)",
      qA6: 'A6. Current Marital Status',
      qA6_never: 'Never married',
      qA6_married: 'Married or living with partner',
      qA6_separated: 'Widowed, divorced or separated',
      qA7: 'A7. Ethnic Group',
      qA7_sinhala: 'Sinhala',
      qA7_tamil: 'Tamil',
      qA7_muslim: 'Muslim',
      qA7_burgher: 'Burgher',
      qA7_other: 'Other',
      qA8: 'A8. Current Residence (during semester / working week)',
      qA8_home: 'Own home or family home',
      qA8_hostel: 'University hostel or hall of residence',
      qA8_boarding: 'Boarding place, rented room or shared house',
      qA8_other: 'Other',
      qA9: 'A9. Ever told by doctor/healthcare worker that you have high blood pressure (hypertension)?',
      qA10: 'A10. Ever advised by doctor/healthcare worker to reduce salt intake?',
      opt_yes: 'Yes',
      opt_no: 'No',
      opt_dont_know: "Don't know",
      measure_height: 'Height (Centimetres)',
      measure_weight: 'Weight (Kilograms)',
      study_cohort: 'Study Cohort / Group',
      calc_bmi: 'Calculated Body Mass Index (BMI)',
      btnProceedRecall: 'Register & Proceed to 24-hr Recall →',

      // Section B Questions (SIAT)
      qB1: 'B1. How often do you add salt to your food at the table (after food is served)?',
      qB2: 'B2. How often is salt added during cooking or food preparation in your household?',
      qB3: 'B3. What type of salt is most commonly used when cooking at home?',
      qB4: 'B4. When cooking rice at home, is salt added to the cooking water?',
      qB5: 'B5. When cooking dhal (lentil) curry, is salt added during preparation?',
      qB6: 'B6. Main meals eaten per week prepared outside home (canteen, kade, restaurant):',
      qB7: 'B7. On an average day, how many cups / glasses of plain water do you drink?',
      b_meals_unit: 'meals / week',
      b_glasses_unit: 'glasses / day',

      // General Likert
      likert_never: 'Never',
      likert_rarely: 'Rarely',
      likert_sometimes: 'Sometimes',
      likert_often: 'Often',
      likert_always: 'Always',
      b4_no_rice: "Don't cook/eat rice at home",
      b5_no_dhal: "Don't consume dhal",

      // Salt Types
      salt_crystal: 'Crystal salt (keta lunu)',
      salt_table: 'Table salt / Fine vacuum-dried salt (kudu lunu)',
      salt_low_sodium: 'Low-sodium / Potassium-enriched salt',
      salt_sea_rock: 'Sea salt or rock salt',
      salt_not_added: 'Salt is not added',

      // Frequency Scale
      freq_label: 'Frequency of Consumption:',
      portion_label: 'Portion Size When Eaten:',
      portion_small: 'Small (< std)',
      portion_medium: 'Medium (std)',
      portion_large: 'Large (> std)',
      std_portion_prefix: 'Std. Portion:',

      // Section D Questions (KAB)
      qD1: 'D1. In your opinion, do you think high salt intake can cause serious health problems?',
      qD2: 'D2. Which health conditions do you think are linked to eating too much salt? (Select all that apply)',
      d2_htn: 'High blood pressure (Hypertension)',
      d2_stroke: 'Stroke',
      d2_heart: 'Heart disease / Heart attack',
      d2_kidney: 'Kidney disease',
      d2_stomach: 'Stomach cancer',
      d2_osteo: 'Osteoporosis',
      qD3: 'D3. How much salt do you think you consume compared to what is recommended for health?',
      d3_far_too_much: 'Far too much',
      d3_too_much: 'Too much',
      d3_just_right: 'Just the right amount',
      d3_too_little: 'Too little',
      d3_far_too_little: 'Far too little',
      qD4: 'D4. How important to you is it to lower the amount of salt in your diet?',
      d4_very: 'Very important',
      d4_somewhat: 'Somewhat important',
      d4_not: 'Not important',
      qD5: 'D5. Which actions do you regularly take to control or reduce your salt intake? (Select all that apply)',
      d5_avoid_processed: 'Avoid eating processed or packaged foods',
      d5_check_labels: 'Look at salt/sodium labels on food packages',
      d5_buy_low_salt: 'Buy low-salt or reduced-sodium alternatives',
      d5_no_table_salt: 'Do not add salt to food at the table',
      d5_cook_less: 'Cook at home with less salt or no salt',
      d5_use_spices: 'Use spices, lemon juice, or vinegar instead of salt',
      d5_avoid_eating_out: 'Avoid eating out at canteens, restaurants, or street stalls',
      d5_no_salt_rice: 'Avoid adding salt when cooking rice',
      d5_soak_fish: 'Rinse or soak dried fish/sprats before cooking',
      d5_none: 'None of the above',
      qD6: 'D6. How often do you check food labels for salt or sodium content when purchasing packaged foods?',
      d6_no_buy: "I don't buy packaged foods",
      qD7: 'D7. Do you know what the WHO recommended maximum daily salt intake is for an adult?',
      d7_5g: 'Yes, 5 grams (approx. 1 level teaspoon)',
      d7_not_sure: 'Yes, but not sure of exact amount',
      d7_no: "No, I don't know",

      // 24-hr Recall & Results
      recallHeader: '24-Hour Dietary Recall (5-Step Multiple-Pass Method)',
      btnSaveMonthly: 'Save SIAT Questionnaire & Compute Salt Prediction →',
      resultsTitle: 'Dietary Salt Intake Assessment Results',
      estDailySalt: 'AI-Assisted Estimated Daily Salt Intake',
      sodiumEquiv: 'Sodium Equivalent:',
      riskLower: 'Lower Risk (<5.0 g/day)',
      riskModerate: 'Moderate Risk (5.0–7.0 g/day)',
      riskHigher: 'Higher Risk (>7.0 g/day)',
      recommendationsTitle: 'Evidence-Based Dietary Salt Recommendations',
      fac_science: 'Faculty of Science',
      fac_agriculture: 'Faculty of Agriculture',
      fac_ahs: 'Faculty of Allied Health Sciences',
      fac_arts: 'Faculty of Arts',
      fac_dental: 'Faculty of Dental Sciences',
      fac_engineering: 'Faculty of Engineering',
      fac_management: 'Faculty of Management',
      fac_medicine: 'Faculty of Medicine',
      fac_vet: 'Faculty of Veterinary Medicine & Animal Science',
      fac_admin: 'Administrative / Central Division',
      fac_other: 'Other Department / Unit',
      cohort_general: 'General Population Cohort (University Community)',
      cohort_htn: 'Hypertension Sub-Study Cohort',
      cohort_intervention: 'Dietary Intervention Group',
      cohort_validation: '24-hr Urine Validation Set',
      heightHint: 'Standard range: 100–250 cm.',
      weightHint: 'Standard range: 25–300 kg.',
      bmiHint: 'Calculated as weight(kg) / height(m)².',
      privacyTitle: 'Data Minimization & Anonymity:',
      privacyDesc: 'HALOS does not collect participant names, identification numbers, addresses, or phone numbers. A cryptographically random Study Identifier will be generated automatically.',
      eligibleCriteria: 'Participant is eligible based on exclusion criteria checklist.',
      physicalMeasures: 'PHYSICAL MEASURES',
      anthroTitle: 'Anthropometric Measurements',
      anthroDesc: 'Measured using standardized stadiometer and calibrated digital scales.',
      researchFooter: 'Research Prototype for Dietary Salt Assessment',
      siatSubtitle: 'Salt Intake Assessment Tool (SIAT)',
      siatTitle: 'Sections B, C, and D: Salt Practices, Food Frequency & Behaviour',
      siatDesc: 'Validated clinical instrument capturing habitual salt addition (past 30 days), 8 categories of high-sodium foods with standardized portion scales, and behavioral drivers for sodium intake estimation.',
      providerTitle: 'Healthcare Provider Administration Model',
      providerDesc: 'Direct clinician / interviewer dietary evaluation mode for clinical consultations and study visits.',
      providerToggle: 'Provider Mode Enabled',
      selectParticipantPrompt: 'Participant / Study ID:',
      syncD1: 'Sync from D1',
      quickBaseline: 'Standard Baseline',
      btnBackRecall: '← Back to 24-hr Recall',
      newAssessment: '+ New Assessment',
      rerunAssessment: '↻ Re-run Assessment'
    },

    // -------------------------------------------------------------
    // SINHALA (සිංහල)
    // -------------------------------------------------------------
    si: {
      appName: 'හේලෝස් ප්‍රොටෝකෝලය',
      appSub: 'පේරාදෙණිය විශ්වවිද්‍යාලය • වෛද්‍ය පීඨය',
      navDashboard: 'ප්‍රධාන පුවරුව',
      navAssessment: '1. සහභාගිවන්නන් තිරගත කිරීම',
      navRecall: '2. පැය 24 ආහාර මතකය',
      navMonthly: '3. ආහාර වාරගණන සහ ලුණු (SIAT)',
      navResults: '4. AI ලුණු තක්සේරුව',
      navPatients: 'සහභාගිවන්නන්ගේ ලේඛනය',
      navResearch: 'පර්යේෂණ විශ්ලේෂණ',
      navAbout: 'ක්‍රමවේදය සහ ප්‍රොටෝකෝලය',
      navLogin: 'පර්යේෂක පිවිසුම',
      step1: 'ලියාපදිංචිය',
      step2: 'පැය 24 මතකය',
      step3: 'ආහාර වාරගණන',
      step4: 'AI ලුණු තක්සේරුව',
      btnSave: 'සුරකින්න සහ ඉදිරියට',
      btnCancel: 'අවලංගු කරන්න',
      btnReset: 'යළි පිහිටුවන්න',
      btnBack: 'ආපසු',
      btnProceed: 'ඉදිරියට යන්න',
      activeParticipant: 'සහභාගිවන්නා',
      previewMode: 'නිරීක්ෂණ මාදිලිය (කැමැත්ත ලබාගෙන නැත)',
      eligible: 'සුදුසුයි',
      ineligible: 'නුසුදුසුයි',
      whoTarget: 'ලෝක සෞඛ්‍ය සංවිධානයේ ඉලක්කය: දිනකට ≤ 5.0g',
      sec0Title: 'කොටස 0: තිරගත කිරීම සහ සුදුසුකම් නිර්ණායක',
      sec0Desc: 'ආහාර තක්සේරුව ආරම්භ කිරීමට පෙර සහභාගිවන්නන්ගේ සුදුසුකම් තහවුරු කරන්න.',
      secATitle: 'කොටස A: සමාජ-ජනගහන ලක්ෂණ',
      secADesc: 'ආයතනික තොරතුරු සහ මූලික හෘද වාහිනී සෞඛ්‍ය දර්ශක.',
      secBTitle: 'කොටස B: සාමාන්‍ය ලුණු එකතු කිරීම සහ පිසීමේ පුරුදු',
      secBDesc: 'නිවසේ පිසීමේ පුරුදු, පිටතින් ආහාර ගැනීමේ වාරගණන සහ දෛනික ජල පරිභෝජනය.',
      secCTitle: 'කොටස C: වැඩි ලුණු අඩංගු ආහාර පරිභෝජන වාරගණන (පසුගිය දින 30)',
      secCDesc: 'ලුණු බහුල ආහාර කාණ්ඩ 8ක් යටතේ සාමාන්‍ය පරිභෝජන වාරගණන සහ ප්‍රමාණය.',
      secDTitle: 'කොටස D: ආහාරයේ ලුණු පිළිබඳ දැනුම, ආකල්ප සහ හැසිරීම් (KAB)',
      secDDesc: 'අධික සෝඩියම් නිසා ඇතිවන සෞඛ්‍ය අවදානම් පිළිබඳ දැනුවත්භාවය සහ ලුණු අඩු කිරීමේ පියවර.',

      // Section 0 Questions
      q0_1: '0.1 ඔබ වයස අවුරුදු 18 හෝ ඊට වැඩි අයෙක්ද?',
      q0_1_yes: 'ඔව් (සුදුසුයි)',
      q0_1_no: 'නැත (අවුරුදු 18ට අඩු — නුසුදුසුයි)',
      q0_2_title: '0.2 බැහැර කිරීමේ නිර්ණායක පිරික්සුම් ලැයිස්තුව',
      q0_2_subtitle: 'දැනට ඔබට අදාළ වන කරුණු සලකුණු කරන්න. කිසියම් කරුණක් තෝරා ඇත්නම්, සදාචාරාත්මක ප්‍රොටෝකෝලය යටතේ අධ්‍යයනයට ඇතුළත් කළ නොහැක.',
      excl_pregnant: 'දැනට ගර්භණී හෝ මව්කිරි දෙන මවක් වේ',
      excl_low_salt: 'වෛද්‍යවරයකු විසින් නියම කරන ලද අඩු ලුණු/සෝඩියම් ආහාර වේලක් අනුගමනය කරයි',
      excl_therapeutic: 'වෙනත් විශේෂ ප්‍රතිකාරික ආහාර වේලක් අනුගමනය කරයි (උදා: වකුගඩු රෝග හෝ දැඩි දියවැඩියා ආහාර සැලැස්ම)',
      excl_tube: 'බට මාර්ගයෙන් ආහාර (Enteral/Tube feeding) ලබා ගනී',
      excl_swallow: 'ගිලීමේ අපහසුතා හෝ සාමාන්‍ය ආහාර ගැනීමට බාධා වන රෝගී තත්ත්වයක් පවතී',
      excl_illness: 'පසුගිය සතිය තුළ සාමාන්‍යයෙන් ගන්නා ආහාර වේල තාවකාලිකව වෙනස් වූ අසනීපයක් පැවතුණි',
      q0_3: '0.3 ඔබ දැනට පේරාදෙණිය විශ්වවිද්‍යාලයේ කාර්ය මණ්ඩලය හෝ ලියාපදිංචි ශිෂ්‍යයෙක් ලෙස සම්බන්ධ වී සිටිනවාද?',
      q0_3_yes: 'ඔව් (කාර්ය මණ්ඩලය හෝ ශිෂ්‍ය)',
      q0_3_no: 'නැත',
      q0_4: '0.4 සිංහල, දෙමළ හෝ ඉංග්‍රීසි භාෂාවෙන් ප්‍රශ්න තේරුම් ගෙන සම්පූර්ණ කිරීමට ඔබට හැකියාවක් තිබේද?',
      q0_4_yes: 'ඔව්',
      q0_4_no: 'නැත',
      q0_5: '0.5 ලිඛිත දැනුවත් කැමැත්ත ලබා ගන්නා ලදීද?',
      q0_5_yes: 'ඔව් (අත්සන් කළ / ඩිජිටල් කැමැත්ත තහවුරු විය)',
      q0_5_no: 'නැත (කැමැත්ත නොමැතිව ඉදිරියට යා නොහැක)',
      q0_6: '0.6 තෝරාගනු ලැබුවහොත් වෙනම දින දෙකක පැය 24 ආහාර මතක සටහන් සම්පූර්ණ කිරීමට ඔබ කැමතිද?',
      q0_6_yes: 'ඔව්, කැමතියි',
      q0_6_no: 'නැත',
      q0_6_not_selected: 'වලංගු කිරීමේ අනුකුලකය සඳහා තෝරාගෙන නොමැත',

      // Section A Questions
      qA1: 'A1. වයස (සම්පූර්ණ අවුරුදු)',
      qA1_hint: 'අවුරුදු 18–120 අතර විය යුතුය.',
      qA2: 'A2. ස්ත්‍රී / පුරුෂ භාවය',
      qA2_male: 'පුරුෂ',
      qA2_female: 'ස්ත්‍රී',
      qA3: 'A3. පේරාදෙණිය විශ්වවිද්‍යාලයේ තත්ත්වය',
      qA3_academic: 'ශාස්ත්‍රීය කාර්ය මණ්ඩලය (Academic)',
      qA3_non_academic: 'අනධ්‍යයන කාර්ය මණ්ඩලය (Non-academic)',
      qA3_undergrad: 'උපාධි අපේක්ෂක ශිෂ්‍ය (Undergraduate)',
      qA3_postgrad: 'පශ්චාත් උපාධි ශිෂ්‍ය (Postgraduate)',
      qA4: 'A4. පීඨය හෝ අංශය',
      qA5: 'A5. සම්පූර්ණ කරන ලද ඉහළම අධ්‍යාපන මට්ටම',
      qA5_ol: 'අ.පො.ස. සාමාන්‍ය පෙළ (O/L) දක්වා',
      qA5_al: 'අ.පො.ස. උසස් පෙළ (A/L)',
      qA5_diploma: 'ඩිප්ලෝමා හෝ සමාන වෘත්තීය සහතිකය',
      qA5_degree: 'ප්‍රථම උපාධිය (Bachelor\'s)',
      qA5_postgrad: 'පශ්චාත් උපාධිය (Master\'s / MPhil / PhD / MD)',
      qA6: 'A6. වර්තමාන විවාහක තත්ත්වය',
      qA6_never: 'අවිවාහක',
      qA6_married: 'විවාහක / සහකරු සමඟ ජීවත්වන',
      qA6_separated: 'වැන්දඹු, දික්කසාද වූ හෝ වෙන්වූ',
      qA7: 'A7. ජනවාර්ගික කණ්ඩායම',
      qA7_sinhala: 'සිංහල',
      qA7_tamil: 'දෙමළ',
      qA7_muslim: 'මුස්ලිම්',
      qA7_burgher: 'බර්ගර්',
      qA7_other: 'වෙනත්',
      qA8: 'A8. වර්තමාන පදිංචිය (සෙමෙස්ටරය / සතිය තුළ)',
      qA8_home: 'තමන්ගේ නිවස හෝ පවුලේ නිවස',
      qA8_hostel: 'විශ්වවිද්‍යාල නේවාසිකාගාරය',
      qA8_boarding: 'බෝඩිම, කුලී කාමරය හෝ බෙදාගත් නිවස',
      qA8_other: 'වෙනත්',
      qA9: 'A9. ඔබට අධික රුධිර පීඩනය (හයිපර්ටෙන්ෂන්) ඇති බව වෛද්‍යවරයකු පවසා තිබේද?',
      qA10: 'A10. ලුණු භාවිතය අඩු කරන ලෙස වෛද්‍යවරයකු හෝ සෞඛ්‍ය සේවකයකු ඔබට උපදෙස් දී තිබේද?',
      opt_yes: 'ඔව්',
      opt_no: 'නැත',
      opt_dont_know: 'නොදනී',
      measure_height: 'උස (සෙන්ටිමීටර)',
      measure_weight: 'බර (කිලෝග්‍රෑම්)',
      study_cohort: 'අධ්‍යයන කණ්ඩායම',
      calc_bmi: 'ගණනය කළ ශරීර ස්කන්ධ දර්ශකය (BMI)',
      btnProceedRecall: 'ලියාපදිංචි වී පැය 24 මතක සටහන වෙත යන්න →',

      // Section B Questions (SIAT)
      qB1: 'B1. ආහාර පිළිගැන්වීමෙන් පසු කෑම මේසයේදී ඔබ කොපමණ නිතර ලුණු එකතු කරනවාද?',
      qB2: 'B2. ඔබේ නිවසේ ආහාර පිසීමේදී හෝ සකස් කිරීමේදී කොපමණ නිතර ලුණු එකතු කරන්නේද?',
      qB3: 'B3. නිවසේ ආහාර පිසීමේදී බහුලවම භාවිතා කරන්නේ කුමන ලුණු වර්ගයද?',
      qB4: 'B4. නිවසේ බත් පිසීමේදී වතුරට ලුණු එකතු කරනවාද?',
      qB5: 'B5. පරිප්පු ව්‍යංජනය පිසීමේදී ලුණු එකතු කරන්නේද?',
      qB6: 'B6. නිවසින් පිටත සකස් කළ (කැන්ටින්, කඩ, අවන්හල්) ප්‍රධාන ආහාර වේල් සතියකට කීයක් ගන්නවාද?:',
      qB7: 'B7. සාමාන්‍ය දිනකදී ඔබ සාමාන්‍ය පානීය ජලය කෝප්ප / වීදුරු කීයක් පානය කරනවාද?:',
      b_meals_unit: 'වේල් / සතියකට',
      b_glasses_unit: 'වීදුරු / දිනකට',

      // General Likert
      likert_never: 'කිසිවිටෙක නැත',
      likert_rarely: 'කලාතුරකින්',
      likert_sometimes: 'සමහර විට',
      likert_often: 'බොහෝ විට',
      likert_always: 'සෑම විටම',
      b4_no_rice: 'නිවසේ බත් නොපිසී/නොකයි',
      b5_no_dhal: 'පරිප්පු ආහාරයට නොගනී',

      // Salt Types
      salt_crystal: 'කැට ලුණු (Crystal salt)',
      salt_table: 'කුඩු ලුණු / මේස ලුණු (Table salt)',
      salt_low_sodium: 'අඩු සෝඩියම් / පොටෑසියම් බහුල ලුණු',
      salt_sea_rock: 'මුහුදු ලුණු හෝ පාෂාණ ලුණු',
      salt_not_added: 'ලුණු එකතු නොකරයි',

      // Frequency Scale
      freq_label: 'පරිභෝජන වාරගණන:',
      portion_label: 'ගන්නා සාමාන්‍ය ප්‍රමාණය:',
      portion_small: 'කුඩා (< සාමාන්‍ය)',
      portion_medium: 'මධ්‍යම (සාමාන්‍ය)',
      portion_large: 'විශාල (> සාමාන්‍ය)',
      std_portion_prefix: 'සම්මත ප්‍රමාණය:',

      // Section D Questions (KAB)
      qD1: 'D1. ඔබේ අදහස අනුව, වැඩිපුර ලුණු භාවිතය බරපතල සෞඛ්‍ය ගැටලු ඇති කළ හැකි යැයි ඔබ සිතනවාද?',
      qD2: 'D2. වැඩිපුර ලුණු ආහාරයට ගැනීම නිසා ඇතිවිය හැකි සෞඛ්‍ය ගැටලු මොනවාදැයි ඔබ සිතන්නේ? (අදාළ සියල්ල තෝරන්න)',
      d2_htn: 'අධික රුධිර පීඩනය (හයිපර්ටෙන්ෂන්)',
      d2_stroke: 'ආඝාතය (ස්ට්‍රෝක්)',
      d2_heart: 'හෘද රෝග / හෘදයාබාධ',
      d2_kidney: 'වකුගඩු රෝග',
      d2_stomach: 'ආමාශ පිළිකා',
      d2_osteo: 'ඔස්ටියෝපොරෝසිස් (අස්ථි දුර්වලවීම)',
      qD3: 'D3. සෞඛ්‍යයට නිර්දේශිත ප්‍රමාණයට සාපේක්ෂව ඔබ කොපමණ ලුණු ප්‍රමාණයක් පරිභෝජනය කරනවා යැයි සිතනවාද?',
      d3_far_too_much: 'බෙහෙවින් වැඩියි',
      d3_too_much: 'වැඩියි',
      d3_just_right: 'නියමිත ප්‍රමාණය',
      d3_too_little: 'අඩුයි',
      d3_far_too_little: 'බෙහෙවින් අඩුයි',
      qD4: 'D4. ඔබේ ආහාරයේ ලුණු ප්‍රමාණය අඩු කිරීම ඔබට කෙතරම් වැදගත්ද?',
      d4_very: 'ඉතා වැදගත්',
      d4_somewhat: 'තරමක් වැදගත්',
      d4_not: 'වැදගත් නොවේ',
      qD5: 'D5. ලුණු භාවිතය පාලනය කිරීමට හෝ අඩු කිරීමට ඔබ නිතිපතා ගන්නා ක්‍රියාමාර්ග මොනවාද? (අදාළ සියල්ල තෝරන්න)',
      d5_avoid_processed: 'සැකසූ හෝ පැකට් කළ ආහාර ගැනීමෙන් වැළකීම',
      d5_check_labels: 'ආහාර පැකට්වල ලුණු/සෝඩියම් ලේබල පරීක්ෂා කිරීම',
      d5_buy_low_salt: 'අඩු ලුණු හෝ අඩු සෝඩියම් ආදේශක මිලදී ගැනීම',
      d5_no_table_salt: 'කෑම මේසයේදී ආහාරවලට ලුණු එකතු නොකිරීම',
      d5_cook_less: 'නිවසේදී අඩු ලුණුවලින් හෝ ලුණු රහිතව පිසීම',
      d5_use_spices: 'ලුණු වෙනුවට කුළුබඩු, දෙහි යුෂ හෝ විනාකිරි භාවිතය',
      d5_avoid_eating_out: 'ආපනශාලා හෝ කඩවලින් පිටත ආහාර ගැනීමෙන් වැළකීම',
      d5_no_salt_rice: 'බත් පිසීමේදී ලුණු එකතු නොකිරීම',
      d5_soak_fish: 'කරවල/හාල්මැස්සන් පිසීමට පෙර සේදීම හෝ පෙඟවීම',
      d5_none: 'ඉහත කිසිවක් නොවේ',
      qD6: 'D6. පැකට් කළ ආහාර මිලදී ගැනීමේදී ලුණු හෝ සෝඩියම් ප්‍රමාණය සඳහා ආහාර ලේබල කොපමණ නිතර පරීක්ෂා කරනවාද?',
      d6_no_buy: 'මම පැකට් කළ ආහාර මිලදී නොගනිමි',
      qD7: 'D7. වැඩිහිටියෙකු සඳහා ලෝක සෞඛ්‍ය සංවිධානය (WHO) නිර්දේශිත උපරිම දෛනික ලුණු ප්‍රමාණය ඔබ දන්නවාද?',
      d7_5g: 'ඔව්, ග්‍රෑම් 5 (ආසන්න වශයෙන් තේ හැඳි 1)',
      d7_not_sure: 'ඔව්, නමුත් නිශ්චිත ප්‍රමාණය ස්ථිර නැත',
      d7_no: 'නැත, මම නොදනිමි',

      // 24-hr Recall & Results
      recallHeader: 'පැය 24 ආහාර මතකය (5-පියවර බහු-වාර ක්‍රමය)',
      btnSaveMonthly: 'SIAT ප්‍රශ්නාවලිය සුරකින්න සහ AI ලුණු තක්සේරුව ගණනය කරන්න →',
      resultsTitle: 'දෛනික ලුණු භාවිතය තක්සේරු කිරීමේ ප්‍රතිඵල',
      estDailySalt: 'AI මඟින් ඇස්තමේන්තු කළ දෛනික ලුණු භාවිතය',
      sodiumEquiv: 'සෝඩියම් සමාන අගය:',
      riskLower: 'අඩු අවදානම (දිනකට <5.0g)',
      riskModerate: 'මධ්‍යම අවදානම (දිනකට 5.0–7.0g)',
      riskHigher: 'වැඩි අවදානම (දිනකට >7.0g)',
      recommendationsTitle: 'සාක්ෂි මත පදනම් වූ දෛනික ලුණු පාලන නිර්දේශ',
      fac_science: 'විද්‍යා පීඨය',
      fac_agriculture: 'කෘෂිකර්ම පීඨය',
      fac_ahs: 'සමසෞඛ්‍ය විද්‍යා පීඨය',
      fac_arts: 'ශාස්ත්‍ර පීඨය',
      fac_dental: 'දන්ත වෛද්‍ය පීඨය',
      fac_engineering: 'ඉංජිනේරු පීඨය',
      fac_management: 'කළමනාකරණ අධ්‍යයන පීඨය',
      fac_medicine: 'වෛද්‍ය පීඨය',
      fac_vet: 'පශු වෛද්‍ය හා සත්ත්ව විද්‍යා පීඨය',
      fac_admin: 'පරිපාලන / මධ්‍යම අංශය',
      fac_other: 'වෙනත් දෙපාර්තමේන්තුව / අංශය',
      cohort_general: 'සාමාන්‍ය ජනගහන කණ්ඩායම (විශ්වවිද්‍යාල ප්‍රජාව)',
      cohort_htn: 'අධිරුධිර පීඩන උප-අධ්‍යයන කණ්ඩායම',
      cohort_intervention: 'ආහාර මැදිහත්වීමේ කණ්ඩායම',
      cohort_validation: 'පැය 24 මුත්‍රා වලංගුකරණ කට්ටලය',
      heightHint: 'ප්‍රමිතිගත පරාසය: 100–250 cm.',
      weightHint: 'ප්‍රමිතිගත පරාසය: 25–300 kg.',
      bmiHint: 'බර(kg) / උස(m)² ලෙස ගණනය කෙරේ.',
      privacyTitle: 'දත්ත අවම කිරීම සහ නිර්නාමිකභාවය:',
      privacyDesc: 'HALOS සහභාගිවන්නන්ගේ නම්, හැඳුනුම්පත් අංක, ලිපින හෝ දුරකථන අංක රැස් නොකරයි. අහඹු අධ්‍යයන හැඳුනුම් අංකයක් ස්වයංක්‍රීයව ජනනය වේ.',
      eligibleCriteria: 'බැහැර කිරීමේ නිර්ණායක මත පදනම්ව සහභාගිවන්නා සුදුසුකම් ලබයි.',
      physicalMeasures: 'ශාරීරික මිනුම්',
      anthroTitle: 'මානවමිතික මිනුම් (Anthropometry)',
      anthroDesc: 'ප්‍රමිතිගත උස මනින උපකරණ සහ ඩිජිටල් තරාදි භාවිතයෙන් මනිනු ලැබේ.',
      researchFooter: 'ආහාරමය ලුණු තක්සේරු කිරීම සඳහා වන පර්යේෂණ ආකෘතිය',
      siatSubtitle: 'ලුණු භාවිතය තක්සේරු කිරීමේ මෙවලම (SIAT)',
      siatTitle: 'කොටස් B, C, සහ D: ලුණු භාවිතය, ආහාර වාර ගණන සහ චර්යාව',
      siatDesc: 'පුරුදු ලෙස ලුණු එකතු කිරීම (පසුගිය දින 30), අධික සෝඩියම් සහිත ආහාර කාණ්ඩ 8ක් සහ චර්යාත්මක සාධක ග්‍රහණය කරගනී.',
      providerTitle: 'සෞඛ්‍ය සේවා සපයන්නන්ගේ පරිපාලන ආකෘතිය',
      providerDesc: 'සායනික උපදේශන සහ අධ්‍යයන චාරිකා සඳහා සෘජු වෛද්‍ය / සම්මුඛ පරීක්ෂක ඇගයීම් ක්‍රමය.',
      providerToggle: 'වෛද්‍ය/පරිපාලන ක්‍රමය සක්‍රියයි',
      selectParticipantPrompt: 'සහභාගිවන්නා / අධ්‍යයන අංකය:',
      syncD1: 'D1 වෙතින් සමමුහුර්ත කරන්න',
      quickBaseline: 'ප්‍රමිතිගත මූලික අගය',
      btnBackRecall: '← පැය 24 ආහාර මතකයට ආපසු',
      newAssessment: '+ නව තක්සේරුවක්',
      rerunAssessment: '↻ නැවත තක්සේරු කරන්න'
    },

    // -------------------------------------------------------------
    // TAMIL (தமிழ்)
    // -------------------------------------------------------------
    ta: {
      appName: 'HALOS நெறிமுறை',
      appSub: 'பேராதனைப் பல்கலைக்கழகம் • மருத்துவ பீடம்',
      navDashboard: 'முகப்பு பலகை',
      navAssessment: '1. பங்கேற்பாளர் பரிசோதனை',
      navRecall: '2. 24 மணி நேர உணவு நினைவுகூரல்',
      navMonthly: '3. உணவு இடைவெளிகள் மற்றும் உப்பு (SIAT)',
      navResults: '4. AI உப்பு மதிப்பீடு',
      navPatients: 'பங்கேற்பாளர் பதிவேடு',
      navResearch: 'ஆராய்ச்சி பகுப்பாய்வு',
      navAbout: 'செயல்முறை மற்றும் நெறிமுறை',
      navLogin: 'ஆராய்ச்சியாளர் நுழைவு',
      step1: 'பதிவு செய்தல்',
      step2: '24 மணி நேர நினைவு',
      step3: 'உணவு இடைவெளி',
      step4: 'AI உப்பு மதிப்பீடு',
      btnSave: 'சேமித்து தொடரவும்',
      btnCancel: 'ரத்து செய்',
      btnReset: 'மீட்டமை',
      btnBack: 'பின்செல்க',
      btnProceed: 'தொடரவும்',
      activeParticipant: 'பங்கேற்பாளர்',
      previewMode: 'முன்னோட்ட முறை (ஒப்புதல் பெறப்படவில்லை)',
      eligible: 'தகுதியானவர்',
      ineligible: 'தகுதியற்றவர்',
      whoTarget: 'WHO இலக்கு: ஒரு நாளைக்கு ≤ 5.0 கிராம்',
      sec0Title: 'பிரிவு 0: பரிசோதனை மற்றும் தகுதி அளவுகோல்கள்',
      sec0Desc: 'உணவு மதிப்பீட்டைத் தொடங்குவதற்கு முன் பங்கேற்பாளர் தகுதியை உறுதிப்படுத்தவும்.',
      secATitle: 'பிரிவு A: சமூக-மக்கள்தொகை பண்புகள்',
      secADesc: 'நிறுவன தகவல்கள் மற்றும் அடிப்படை இருதய சுகாதார குறிகாட்டிகள்.',
      secBTitle: 'பிரிவு B: பொதுவான உப்பு சேர்த்தல் மற்றும் சமையல் பழக்கவழக்கங்கள்',
      secBDesc: 'வீட்டு சமையல் பழக்கவழக்கங்கள், வெளியே சாப்பிடும் உணவு மற்றும் தினசரி நீர் அருந்துதல்.',
      secCTitle: 'பிரிவு C: அதிக உப்பு நிறைந்த உணவுகளின் அதிர்வெண் (கடந்த 30 நாட்கள்)',
      secCDesc: '8 அதிக சோடியம் உணவுப் பிரிவுகளில் வழக்கமான நுகர்வு அதிர்வெண் மற்றும் அளவு.',
      secDTitle: 'பிரிவு D: உணவு உப்பு குறித்த அறிவு, அணுகுமுறைகள் மற்றும் நடத்தை (KAB)',
      secDDesc: 'அதிக சோடியத்தால் ஏற்படும் ஆபத்துகள் பற்றிய விழிப்புணர்வு மற்றும் உப்பு குறைப்பு நடவடிக்கைகள்.',

      // Section 0 Questions
      q0_1: '0.1 நீங்கள் 18 வயது அல்லது அதற்கு மேற்பட்டவரா?',
      q0_1_yes: 'ஆம் (தகுதியானவர்)',
      q0_1_no: 'இல்லை (18 வயதுக்குட்பட்டவர் — தகுதியற்றவர்)',
      q0_2_title: '0.2 விலக்கு அளவுகோல் சரிபார்ப்புப் பட்டியல்',
      q0_2_subtitle: 'தற்போது உங்களுக்கு பொருந்தும் நிபந்தனைகளைத் தேர்ந்தெடுக்கவும். ஏதேனும் ஒன்று தேர்ந்தெடுக்கப்பட்டால், ஆய்வில் பங்கேற்க முடியாது.',
      excl_pregnant: 'தற்போது கர்ப்பமாக அல்லது பாலூட்டும் தாயாக உள்ளவர்',
      excl_low_salt: 'மருத்துவரால் பரிந்துரைக்கப்பட்ட குறைந்த உப்பு/சோடியம் உணவு முறையைப் பின்பற்றுபவர்',
      excl_therapeutic: 'வேறு ஏதேனும் பரிந்துரைக்கப்பட்ட சிகிச்சை உணவு முறையைப் பின்பற்றுபவர் (எ.கா. சிறுநீரக உணவு அல்லது கடுமையான நீரிழிவு உணவு)',
      excl_tube: 'குழாய் மூலம் உணவு உட்கொள்பவர் (Tube feeding)',
      excl_swallow: 'விழுங்குவதில் சிரமம் அல்லது சாதாரண உணவு உண்பதைத் தடுக்கும் மருத்துவ நிலை உள்ளவர்',
      excl_illness: 'கடந்த வாரத்தில் வழக்கமான உணவை தற்காலிகமாக மாற்றிய நோய் பாதிப்பு இருந்ததா',
      q0_3: '0.3 நீங்கள் தற்போது பேராதனைப் பல்கலைக்கழகத்தில் பணியாளராகவோ அல்லது பதிவுசெய்த மாணவராகவோ உள்ளவரா?',
      q0_3_yes: 'ஆம் (பணியாளர் அல்லது மாணவர்)',
      q0_3_no: 'இல்லை',
      q0_4: '0.4 சிங்களம், தமிழ் அல்லது ஆங்கிலத்தில் கேள்விகளைப் புரிந்துகொண்டு பூர்த்தி செய்ய உங்களுக்கு முடியுமா?',
      q0_4_yes: 'ஆம்',
      q0_4_no: 'இல்லை',
      q0_5: '0.5 எழுத்துப்பூர்வ தகவல் ஒப்புதல் பெறப்பட்டதா?',
      q0_5_yes: 'ஆம் (கையெழுத்திட்ட / டிஜிட்டல் ஒப்புதல் உறுதி செய்யப்பட்டது)',
      q0_5_no: 'இல்லை (ஒப்புதல் இன்றி தொடர முடியாது)',
      q0_6: '0.6 தேர்ந்தெடுக்கப்பட்டால் இரண்டு தனித்தனி நாட்களில் 24 மணி நேர உணவு நினைவுகூரலை நிறைவு செய்ய சம்மதமா?',
      q0_6_yes: 'ஆம், சம்மதம்',
      q0_6_no: 'இல்லை',
      q0_6_not_selected: 'சரிபார்ப்பு மாதிரிக்கு தேர்ந்தெடுக்கப்படவில்லை',

      // Section A Questions
      qA1: 'A1. வயது (நிறைவு செய்யப்பட்ட ஆண்டுகள்)',
      qA1_hint: '18–120 ஆண்டுகளுக்குள் இருக்க வேண்டும்.',
      qA2: 'A2. பாலினம்',
      qA2_male: 'ஆண்',
      qA2_female: 'பெண்',
      qA3: 'A3. பேராதனைப் பல்கலைக்கழகத்தில் நிலை',
      qA3_academic: 'கல்விசார் பணியாளர் (Academic)',
      qA3_non_academic: 'கல்விசாரா பணியாளர் (Non-academic)',
      qA3_undergrad: 'இளங்கலை மாணவர் (Undergraduate)',
      qA3_postgrad: 'முதுகலை மாணவர் (Postgraduate)',
      qA4: 'A4. பீடம் அல்லது பிரிவு',
      qA5: 'A5. பூர்த்தி செய்யப்பட்ட அதிஉயர் கல்வித் தகுதி',
      qA5_ol: 'க.பொ.த சாதாரண தரம் (O/L) வரை',
      qA5_al: 'க.பொ.த உயர்தரம் (A/L)',
      qA5_diploma: 'டிப்ளோமா அல்லது தொழிற்கல்வி சான்றிதழ்',
      qA5_degree: 'இளங்கலை பட்டம் (Bachelor\'s)',
      qA5_postgrad: 'முதுகலை பட்டம் (Master\'s / MPhil / PhD / MD)',
      qA6: 'A6. தற்போதைய திருமண நிலை',
      qA6_never: 'திருமணமாகாதவர்',
      qA6_married: 'திருமணமானவர் / இணையுடன் வாழ்பவர்',
      qA6_separated: 'விதவை, விவாகரத்து பெற்றவர் அல்லது பிரிந்து வாழ்பவர்',
      qA7: 'A7. இனக் குழு',
      qA7_sinhala: 'சிங்களவர்',
      qA7_tamil: 'தமிழர்',
      qA7_muslim: 'முஸ்லிம்',
      qA7_burgher: 'பரங்கியர் (Burgher)',
      qA7_other: 'ஏனையோர்',
      qA8: 'A8. தற்போதைய வசிப்பிடம் (பருவக்காலம் / வார நாட்களில்)',
      qA8_home: 'சொந்த வீடு அல்லது குடும்ப வீடு',
      qA8_hostel: 'பல்கலைக்கழக தங்குமிடம் (விடுதி)',
      qA8_boarding: 'தங்கும் விடுதி, வாடகை அறை அல்லது பகிர்ந்த வீடு',
      qA8_other: 'ஏனையவை',
      qA9: 'A9. உங்களுக்கு உயர் இரத்த அழுத்தம் இருப்பதாக மருத்துவர் அல்லது சுகாதார ஊழியர் கூறியுள்ளாரா?',
      qA10: 'A10. உப்பு உட்கொள்ளலைக் குறைக்குமாறு மருத்துவர் அல்லது சுகாதார ஊழியர் ஆலோசனை வழங்கியுள்ளாரா?',
      opt_yes: 'ஆம்',
      opt_no: 'இல்லை',
      opt_dont_know: 'தெரியாது',
      measure_height: 'உயரம் (சென்டிமீட்டர்)',
      measure_weight: 'எடை (கிலோகிராம்)',
      study_cohort: 'ஆய்வுக் குழு',
      calc_bmi: 'கணக்கிடப்பட்ட உடல் நிறை குறியீட்டெண் (BMI)',
      btnProceedRecall: 'பதிவுசெய்து 24 மணி நேர நினைவுகூரலுக்கு செல்க →',

      // Section B Questions (SIAT)
      qB1: 'B1. உணவு பரிமாறப்பட்ட பிறகு மேசையில் உங்கள் உணவில் எவ்வளவு அடிக்கடி உப்பு சேர்க்கிறீர்கள்?',
      qB2: 'B2. உங்கள் வீட்டில் சமையல் அல்லது உணவு தயாரிப்பின் போது எவ்வளவு அடிக்கடி உப்பு சேர்க்கப்படுகிறது?',
      qB3: 'B3. வீட்டில் சமைக்கும் போது பொதுவாகப் பயன்படுத்தப்படும் உப்பு வகை எது?',
      qB4: 'B4. வீட்டில் சோறு சமைக்கும் போது சமையல் நீரில் உப்பு சேர்க்கப்படுகிறதா?',
      qB5: 'B5. பருப்பு கறி சமைக்கும் போது தயாரிப்பில் உப்பு சேர்க்கப்படுகிறதா?',
      qB6: 'B6. வீட்டிற்கு வெளியே தயாரிக்கப்பட்ட (உணவகம், ஹோட்டல்) பிரதான உணவுகள் வாரத்திற்கு எத்தனை முறை உட்கொள்கிறீர்கள்?:',
      qB7: 'B7. ஒரு சராசரி நாளில் நீங்கள் எத்தனை டம்ளர் சாதாரண தண்ணீர் குடிக்கிறீர்கள்?:',
      b_meals_unit: 'உணவுகள் / வாரம்',
      b_glasses_unit: 'டம்ளர்கள் / நாள்',

      // General Likert
      likert_never: 'ஒருபோதும் இல்லை',
      likert_rarely: 'அரிதாக',
      likert_sometimes: 'சில நேரங்களில்',
      likert_often: 'அடிக்கடி',
      likert_always: 'எப்போதும்',
      b4_no_rice: 'வீட்டில் சோறு சமைப்பதில்லை/உண்பதில்லை',
      b5_no_dhal: 'பருப்பு உட்கொள்வதில்லை',

      // Salt Types
      salt_crystal: 'கல் உப்பு (கெட்ட லுணு)',
      salt_table: 'தூள் உப்பு / மேசை உப்பு (குடு லுணு)',
      salt_low_sodium: 'குறைந்த சோடியம் / பொட்டாசியம் செறிந்த உப்பு',
      salt_sea_rock: 'கடல் உப்பு அல்லது பாறை உப்பு',
      salt_not_added: 'உப்பு சேர்ப்பதில்லை',

      // Frequency Scale
      freq_label: 'உட்கொள்ளும் அதிர்வெண்:',
      portion_label: 'உட்கொள்ளும் அளவு:',
      portion_small: 'சிறியது (< வழக்கமான)',
      portion_medium: 'நடுத்தர (வழக்கமான)',
      portion_large: 'பெரியது (> வழக்கமான)',
      std_portion_prefix: 'வழக்கமான அளவு:',

      // Section D Questions (KAB)
      qD1: 'D1. உங்கள் கருத்தின்படி, அதிக உப்பு உட்கொள்வது தீவிர சுகாதாரப் பிரச்சினைகளை ஏற்படுத்தும் என்று நினைக்கிறீர்களா?',
      qD2: 'D2. அதிக உப்பு சாப்பிடுவதால் ஏற்படும் சுகாதாரப் பிரச்சினைகள் எவை என்று நினைக்கிறீர்கள்? (பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்)',
      d2_htn: 'உயர் இரத்த அழுத்தம் (Hypertension)',
      d2_stroke: 'பக்கவாதம் (Stroke)',
      d2_heart: 'இதய நோய் / மாரடைப்பு',
      d2_kidney: 'சிறுநீரக நோய்',
      d2_stomach: 'வயிற்றுப் புற்றுநோய்',
      d2_osteo: 'எலும்புப்புரை நோய் (Osteoporosis)',
      qD3: 'D3. ஆரோக்கியத்திற்குப் பரிந்துரைக்கப்பட்ட அளவோடு ஒப்பிடும்போது நீங்கள் எவ்வளவு உப்பு உட்கொள்கிறீர்கள் என்று நினைக்கிறீர்கள்?',
      d3_far_too_much: 'மிக அதிகம்',
      d3_too_much: 'அதிகம்',
      d3_just_right: 'சரியான அளவு',
      d3_too_little: 'குறைவு',
      d3_far_too_little: 'மிகக் குறைவு',
      qD4: 'D4. உங்கள் உணவில் உப்பின் அளவைக் குறைப்பது உங்களுக்கு எவ்வளவு முக்கியம்?',
      d4_very: 'மிகவும் முக்கியம்',
      d4_somewhat: 'ஓரளவு முக்கியம்',
      d4_not: 'முக்கியமில்லை',
      qD5: 'D5. உப்பு உட்கொள்ளலைக் கட்டுப்படுத்த அல்லது குறைக்க நீங்கள் வழக்கமாக எடுக்கும் நடவடிக்கைகள் எவை? (பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்)',
      d5_avoid_processed: 'பதப்படுத்தப்பட்ட அல்லது பொதி செய்யப்பட்ட உணவுகளைத் தவிர்த்தல்',
      d5_check_labels: 'உணவுப் பொதிகளில் உப்பு/சோடியம் லேபிள்களைப் பார்த்தல்',
      d5_buy_low_salt: 'குறைந்த உப்பு அல்லது குறைக்கப்பட்ட சோடியம் மாற்றீடுகளை வாங்குதல்',
      d5_no_table_salt: 'சாப்பாட்டு மேசையில் உணவில் உப்பு சேர்க்காதிருத்தல்',
      d5_cook_less: 'வீட்டில் குறைந்த உப்புடன் அல்லது உப்பின்றி சமைத்தல்',
      d5_use_spices: 'உப்புக்குப் பதிலாக மசாலா, எலுமிச்சை சாறு அல்லது வினிகர் பயன்படுத்துதல்',
      d5_avoid_eating_out: 'உணவகங்கள் அல்லது தெருவோரக் கடைகளில் சாப்பிடுவதைத் தவிர்த்தல்',
      d5_no_salt_rice: 'சோறு சமைக்கும் போது உப்பு சேர்க்காதிருத்தல்',
      d5_soak_fish: 'கருவாடு/நெத்திலியை சமைப்பதற்கு முன் கழுவுதல் அல்லது ஊறவைத்தல்',
      d5_none: 'மேலே உள்ள எதுவுமில்லை',
      qD6: 'D6. பொதி செய்யப்பட்ட உணவுகளை வாங்கும் போது உப்பு அல்லது சோடியம் உள்ளடக்கத்திற்கான உணவு லேபிள்களை எவ்வளவு அடிக்கடி சரிபார்க்கிறீர்கள்?',
      d6_no_buy: 'நான் பொதி செய்யப்பட்ட உணவுகளை வாங்குவதில்லை',
      qD7: 'D7. ஒரு பெரியவருக்கு உலக சுகாதார நிறுவனம் (WHO) பரிந்துரைக்கும் அதிகபட்ச தினசரி உப்பு உட்கொள்ளல் என்னவென்று உங்களுக்குத் தெரியுமா?',
      d7_5g: 'ஆம், 5 கிராம் (தோராயமாக 1 மட்டமான தேக்கரண்டி)',
      d7_not_sure: 'ஆம், ஆனால் சரியான அளவு உறுதியாகத் தெரியவில்லை',
      d7_no: 'இல்லை, எனக்குத் தெரியாது',

      // 24-hr Recall & Results
      recallHeader: '24 மணி நேர உணவு நினைவுகூரல் (5-படி பல-முறை அணுகுமுறை)',
      btnSaveMonthly: 'SIAT வினாத்தாளைச் சேமித்து AI உப்பு கணிப்பை கணக்கிடுங்கள் →',
      resultsTitle: 'உணவு உப்பு உட்கொள்ளல் மதிப்பீட்டு முடிவுகள்',
      estDailySalt: 'AI-உதவியுடன் மதிப்பிடப்பட்ட தினசரி உப்பு உட்கொள்ளல்',
      sodiumEquiv: 'சோடியம் சமவலு:',
      riskLower: 'குறைந்த ஆபத்து (நாளுக்கு <5.0g)',
      riskModerate: 'மிதமான ஆபத்து (நாளுக்கு 5.0–7.0g)',
      riskHigher: 'அதிக ஆபத்து (நாளுக்கு >7.0g)',
      recommendationsTitle: 'சான்றுகள் அடிப்படையிலான தினசரி உணவு உப்பு பரிந்துரைகள்',
      fac_science: 'அறிவியல் பீடம்',
      fac_agriculture: 'விவசாய பீடம்',
      fac_ahs: 'இணை சுகாதார அறிவியல் பீடம்',
      fac_arts: 'கலைப்பீடம்',
      fac_dental: 'பல் மருத்துவ பீடம்',
      fac_engineering: 'பொறியியல் பீடம்',
      fac_management: 'முகாமைத்துவ கற்கைகள் பீடம்',
      fac_medicine: 'மருத்துவ பீடம்',
      fac_vet: 'கால்நடை மருத்துவம் மற்றும் விலங்கு அறிவியல் பீடம்',
      fac_admin: 'நிர்வாக / மத்திய பிரிவு',
      fac_other: 'வேறு திணைக்களம் / பிரிவு',
      cohort_general: 'பொது மக்கள் குழு (பல்கலைக்கழக சமூகம்)',
      cohort_htn: 'உயர் இரத்த அழுத்த துணை ஆய்வு குழு',
      cohort_intervention: 'உணவு தலையீட்டு குழு',
      cohort_validation: '24 மணி நேர சிறுநீர் சரிபார்ப்பு குழு',
      heightHint: 'நிலையான வரம்பு: 100–250 செ.மீ.',
      weightHint: 'நிலையான வரம்பு: 25–300 கிலோ.',
      bmiHint: 'எடை(கிலோ) / உயரம்(மீ)² என கணக்கிடப்படுகிறது.',
      privacyTitle: 'தரவு பாதுகாப்பு மற்றும் அநாமதேயம்:',
      privacyDesc: 'HALOS பங்கேற்பாளர்களின் பெயர்கள், அடையாள அட்டை எண்கள், முகவரிகள் அல்லது தொலைபேசி எண்களை சேகரிப்பதில்லை. ஒரு சீரற்ற ஆய்வு அடையாள எண் தானாகவே உருவாக்கப்படும்.',
      eligibleCriteria: 'விலக்கு அளவுகோல் சரிபார்ப்புப் பட்டியலின் அடிப்படையில் பங்கேற்பாளர் தகுதியுடையவர்.',
      physicalMeasures: 'உடலளவியல் அளவீடுகள்',
      anthroTitle: 'உடலளவியல் அளவீடுகள் (Anthropometry)',
      anthroDesc: 'நிலையான உயர அளவீட்டு கருவி மற்றும் டிஜிட்டல் தராசுகள் மூலம் அளவிடப்படுகிறது.',
      researchFooter: 'உணவு உப்பு மதிப்பீட்டிற்கான ஆராய்ச்சி மாதிரி',
      siatSubtitle: 'உப்பு உட்கொள்ளல் மதிப்பீட்டு கருவி (SIAT)',
      siatTitle: 'பிரிவுகள் B, C, மற்றும் D: உப்பு நடைமுறைகள், உணவு இடைவெளிகள் மற்றும் நடத்தை',
      siatDesc: 'வழக்கமான உப்பு சேர்த்தல் (கடந்த 30 நாட்கள்), 8 அதிக சோடியம் உணவுப் பிரிவுகள் மற்றும் நடத்தை காரணிகளை மதிப்பீடு செய்கிறது.',
      providerTitle: 'சுகாதார வழங்குநர் நிர்வாக மாதிரி',
      providerDesc: 'மருத்துவ ஆலோசனைகள் மற்றும் ஆய்வு சந்திப்புகளுக்கான நேரடி மதிப்பீட்டு முறை.',
      providerToggle: 'வழங்குநர் முறை இயக்கப்பட்டது',
      selectParticipantPrompt: 'பங்கேற்பாளர் / ஆய்வு எண்:',
      syncD1: 'D1 இலிருந்து ஒத்திசைக்கவும்',
      quickBaseline: 'நிலையான அடிப்படை நிலை',
      btnBackRecall: '← 24 மணி நேர உணவுக்குத் திரும்பு',
      newAssessment: '+ புதிய மதிப்பீடு',
      rerunAssessment: '↻ மறுமதிப்பீடு செய்க'
    }
  };

  // Section C Multilingual Food Items Registry
  const SECTION_C_I18N = {
    C1: {
      en: 'C1. Salted and Preserved Fish & Seafood',
      si: 'C1. ලුණු දැමූ සහ කල් තබා ගත් මාළු හා මුහුදු ආහාර',
      ta: 'C1. உப்பு மற்றும் பதப்படுத்தப்பட்ட மீன் மற்றும் கடல் உணவுகள்'
    },
    C1_1: {
      name: {
        en: 'Dried fish (Karawala - kattawa, balaya, mora, etc.)',
        si: 'කරවල (කට්‍ටවා, බලයා, මෝරා, තලපත් ආදී)',
        ta: 'கருவாடு (கட்டவா, பலையா, சுறா, தலபத் போன்றவை)'
      },
      portion: {
        en: '1 small-medium piece (~30g)',
        si: 'කුඩා-මධ්‍යම කැබැල්ලක් (~30g)',
        ta: '1 சிறிய-நடுத்தர துண்டு (~30g)'
      }
    },
    C1_2: {
      name: {
        en: 'Salted dried sprats (Halmasso / Nethili)',
        si: 'ලුණු දැමූ හාල්මැස්සන් (කරවල හාල්මැස්සන්)',
        ta: 'உப்பு நெத்திலி கருவாடு (நெத்திலி)'
      },
      portion: {
        en: '1-2 tablespoons (~20g)',
        si: 'මේස හැඳි 1-2 (~20g)',
        ta: '1-2 மேசைக்கரண்டி (~20g)'
      }
    },
    C1_3: {
      name: {
        en: 'Maldive fish (Umbalakada) added to sambols/curries',
        si: 'උම්බලකඩ (සම්බෝල හෝ ව්‍යංජන සඳහා යොදන)',
        ta: 'மாசி கருவாடு (உம்பளக்கடை - சம்பல்/கறிகளில்)'
      },
      portion: {
        en: '1 teaspoon (~5g)',
        si: 'තේ හැඳි 1 (~5g)',
        ta: '1 தேக்கரண்டி (~5g)'
      }
    },
    C1_4: {
      name: {
        en: 'Canned fish (Salmon / Mackerel in brine or oil)',
        si: 'ටින් මාළු (සැමන් / මැකරල්)',
        ta: 'டின் மீன் (சால்மன் / மெக்கரல்)'
      },
      portion: {
        en: '1/2 can or 1-2 chunks (~75g)',
        si: 'ටින් 1/2ක් හෝ කැබලි 1-2ක් (~75g)',
        ta: '1/2 டின் அல்லது 1-2 துண்டுகள் (~75g)'
      }
    },

    C2: {
      en: 'C2. Processed Meat Products',
      si: 'C2. සැකසූ මස් නිෂ්පාදන',
      ta: 'C2. பதப்படுத்தப்பட்ட இறைச்சி பொருட்கள்'
    },
    C2_1: {
      name: {
        en: 'Sausages (chicken, pork, beef)',
        si: 'සොසේජස් (කුකුළු, ඌරු, හරක් මස්)',
        ta: 'சாசேஜ்கள் (கோழி, பன்றி, மாட்டிறைச்சி)'
      },
      portion: {
        en: '1-2 links (~60g)',
        si: 'කරල් 1-2ක් (~60g)',
        ta: '1-2 சாசேஜ்கள் (~60g)'
      }
    },
    C2_2: {
      name: {
        en: 'Meatballs (curried or fried)',
        si: 'මීට්බෝල්ස් (බැදපු හෝ කරි කළ මස් ගුලි)',
        ta: 'மீட்பால்ஸ் (பொரித்த அல்லது கறி வைத்த இறைச்சி உருண்டைகள்)'
      },
      portion: {
        en: '3-4 pieces (~60g)',
        si: 'ගුලි 3-4ක් (~60g)',
        ta: '3-4 உருண்டைகள் (~60g)'
      }
    },
    C2_3: {
      name: {
        en: 'Ham, bacon, or luncheon meat',
        si: 'හැම්, බේකන් හෝ ලන්චන් මීට්',
        ta: 'ஹாம், பேக்கன் அல்லது லஞ்சன் மீட்'
      },
      portion: {
        en: '1-2 slices (~40g)',
        si: 'පෙති 1-2ක් (~40g)',
        ta: '1-2 துண்டுகள் (~40g)'
      }
    },

    C3: {
      en: 'C3. Traditional Condiments, Sambols & Pickles',
      si: 'C3. පාරම්පරික අච්චාරු, සම්බෝල සහ රසකාරක',
      ta: 'C3. பாரம்பரிய சம்பல், ஊறுகாய் மற்றும் சுவையூட்டிகள்'
    },
    C3_1: {
      name: {
        en: 'Lime pickle (Lunu dehi) or Malay/Sinhala achcharu',
        si: 'ලුණු දෙහි හෝ මැලේ/සිංහල අච්චාරු',
        ta: 'உப்பு எலுமிச்சை (லுணு தெஹி) அல்லது மலாய்/சிங்கள ஊறுகாய்'
      },
      portion: {
        en: '1 piece or 1 tbsp (~15g)',
        si: 'කැබැල්ලක් හෝ මේස හැඳි 1 (~15g)',
        ta: '1 துண்டு அல்லது 1 மேசைக்கரண்டி (~15g)'
      }
    },
    C3_2: {
      name: {
        en: 'Lunu miris (onion, chilli, salt, lime grind)',
        si: 'ලුණු මිරිස් (ලූනු, මිරිස්, ලුණු, දෙහි)',
        ta: 'லுணு மிரிஸ் (வெங்காயம், மிளகாய், உப்பு, எலுமிச்சை)'
      },
      portion: {
        en: '1 tablespoon (~20g)',
        si: 'මේස හැඳි 1 (~20g)',
        ta: '1 மேசைக்கரண்டி (~20g)'
      }
    },
    C3_3: {
      name: {
        en: 'Katta sambol or Seeni sambol',
        si: 'කට්ට සම්බෝල හෝ සීනි සම්බෝල',
        ta: 'கட்ட சம்பல் அல்லது சீனி சம்பல்'
      },
      portion: {
        en: '1 tablespoon (~20g)',
        si: 'මේස හැඳි 1 (~20g)',
        ta: '1 மேசைக்கரண்டி (~20g)'
      }
    },
    C3_4: {
      name: {
        en: 'Mango / Ambarella chutney',
        si: 'අඹ හෝ ඇඹරැල්ලා චට්නි',
        ta: 'மாங்காய் அல்லது அம்பரல்லா சட்னி'
      },
      portion: {
        en: '1 tablespoon (~20g)',
        si: 'මේස හැඳි 1 (~20g)',
        ta: '1 மேசைக்கரண்டி (~20g)'
      }
    },

    C4: {
      en: 'C4. Savoury Snacks, Crackers & Bites',
      si: 'C4. ලුණු රසැති කෙටි ආහාර, ක්‍රැකර් සහ බයිට්ස්',
      ta: 'C4. காரமான சிற்றுண்டிகள், கிராக்கர்ஸ் மற்றும் பைட்ஸ்'
    },
    C4_1: {
      name: {
        en: 'Papadam (fried crispy lentil wafers)',
        si: 'පපඩම් (බැදපු)',
        ta: 'பப்படம் (பொரித்த அப்பளம்)'
      },
      portion: {
        en: '2-3 discs (~15g)',
        si: 'පතුරු 2-3ක් (~15g)',
        ta: '2-3 வட்டங்கள் (~15g)'
      }
    },
    C4_2: {
      name: {
        en: 'Murukku, mixture, or fried savoury bites',
        si: 'මුරුක්කු, මික්ස්චර් හෝ බැදපු බයිට්ස්',
        ta: 'முறுக்கு, மிக்சர் அல்லது பொரித்த கார வகைகள்'
      },
      portion: {
        en: '1 small packet / handful (~30g)',
        si: 'කුඩා පැකට් 1ක් / අතලොස්සක් (~30g)',
        ta: '1 சிறிய பாக்கெட் / ஒரு பிடி (~30g)'
      }
    },
    C4_3: {
      name: {
        en: 'Potato crisps / packaged chips',
        si: 'අල චිප්ස් / පැකට් කළ චිප්ස්',
        ta: 'உருளைக்கிழங்கு சிப்ஸ் / பாக்கெட் சிப்ஸ்'
      },
      portion: {
        en: '1 small packet (~35g)',
        si: 'කුඩා පැකට් 1ක් (~35g)',
        ta: '1 சிறிய பாக்கெட் (~35g)'
      }
    },
    C4_4: {
      name: {
        en: 'Cream crackers / savoury biscuits',
        si: 'ක්‍රීම් ක්‍රැකර් / ලුණු බිස්කට්',
        ta: 'கிரீம் கிராக்கர்ஸ் / கார பிஸ்கட்டுகள்'
      },
      portion: {
        en: '3-4 crackers (~40g)',
        si: 'බිස්කට් 3-4ක් (~40g)',
        ta: '3-4 பிஸ்கட்டுகள் (~40g)'
      }
    },
    C4_5: {
      name: {
        en: 'Salted roasted peanuts / fried kadala / green gram bites',
        si: 'ලුණු දැමූ රටකජු / බැදපු කඩල / මුං ඇට බයිට්ස්',
        ta: 'உப்பு வேர்க்கடலை / வறுத்த கடலை / பயறு வகைகள்'
      },
      portion: {
        en: '1 handful (~30g)',
        si: 'අතලොස්සක් (~30g)',
        ta: 'ஒரு பிடி (~30g)'
      }
    },

    C5: {
      en: 'C5. Short Eats, Bakery Foods & Street Foods',
      si: 'C5. ෂෝර්ට් ඊට්ස්, බේකරි නිෂ්පාදන සහ වීදි ආහාර',
      ta: 'C5. ஷார்ட் ஈட்ஸ், பேக்கரி உணவுகள் மற்றும் தெரு உணவுகள்'
    },
    C5_1: {
      name: {
        en: 'Short eats (fish/vegetable rolls, patties, samosas)',
        si: 'ෂෝර්ට් ඊට්ස් (රෝල්ස්, පැටිස්, සැමෝසා)',
        ta: 'ஷார்ட் ஈட்ஸ் (ரோல்ஸ், பட்டீஸ், சமோசா)'
      },
      portion: {
        en: '1-2 items (~80g)',
        si: 'ගෙඩි 1-2ක් (~80g)',
        ta: '1-2 உருப்படிகள் (~80g)'
      }
    },
    C5_2: {
      name: {
        en: 'Vegetable roti, egg roti, or paratha',
        si: 'එළවළු රොටි, බිත්තර රොටි හෝ පරාටා',
        ta: 'மரக்கறி ரொட்டி, முட்டை ரொட்டி அல்லது பரோட்டா'
      },
      portion: {
        en: '1 piece (~80g)',
        si: 'රොටි 1ක් (~80g)',
        ta: '1 ரொட்டி (~80g)'
      }
    },
    C5_3: {
      name: {
        en: 'Commercial bakery bread (sandwich loaf / roast paan)',
        si: 'බේකරි පාන් (සෑන්ඩ්විච් පාන් / රෝස්ට් පාන්)',
        ta: 'பேக்கரி பாண் (சான்ட்விச் பாண் / ரோஸ்ட் பாண்)'
      },
      portion: {
        en: '2 slices (~60g)',
        si: 'පෙති 2ක් (~60g)',
        ta: '2 துண்டுகள் (~60g)'
      }
    },

    C6: {
      en: 'C6. Commercial Sauces & Seasonings',
      si: 'C6. වාණිජ සෝස් වර්ග සහ රසකාරක',
      ta: 'C6. வணிக சாஸ்கள் மற்றும் சுவையூட்டிகள்'
    },
    C6_1: {
      name: {
        en: 'Soya sauce (added to food or used in cooking)',
        si: 'සෝයා සෝස් (ආහාරයට හෝ පිසීමට යොදන)',
        ta: 'சோயா சாஸ் (உணவில் அல்லது சமையலில் சேர்ப்பது)'
      },
      portion: {
        en: '1 tablespoon (~15ml)',
        si: 'මේස හැඳි 1 (~15ml)',
        ta: '1 மேசைக்கரண்டி (~15ml)'
      }
    },
    C6_2: {
      name: {
        en: 'Tomato sauce or chilli sauce',
        si: 'තක්කාලි සෝස් හෝ මිරිස් සෝස්',
        ta: 'தக்காளி சாஸ் அல்லது மிளகாய் சாஸ்'
      },
      portion: {
        en: '1 tablespoon (~15ml)',
        si: 'මේස හැඳි 1 (~15ml)',
        ta: '1 மேசைக்கரண்டி (~15ml)'
      }
    },
    C6_3: {
      name: {
        en: 'Chilli paste (Chinese/Sri Lankan style)',
        si: 'චිලි පේස්ට් (චයිනීස්/ශ්‍රී ලාංකික)',
        ta: 'மிளகாய் பேஸ்ட் (சைனீஸ்/இலங்கை முறை)'
      },
      portion: {
        en: '1 teaspoon (~10g)',
        si: 'තේ හැඳි 1 (~10g)',
        ta: '1 தேக்கரண்டி (~10g)'
      }
    },
    C6_4: {
      name: {
        en: 'MSG (Ajinomoto) or seasoning cubes/powder (Maggi/Knorr)',
        si: 'අජිනමොටෝ (MSG) හෝ රස කැට/පවුඩර් (මැගී/නෝර්)',
        ta: 'அஜினோமோட்டோ (MSG) அல்லது சுவையூட்டும் கட்டிகள் (Maggi/Knorr)'
      },
      portion: {
        en: '1 cube or 1/2 tsp',
        si: 'කැට 1ක් හෝ තේ හැඳි 1/2ක්',
        ta: '1 கட்டி அல்லது 1/2 தேக்கரண்டி'
      }
    },

    C7: {
      en: 'C7. Instant Foods & Fast Food',
      si: 'C7. ක්ෂණික ආහාර සහ ෆාස්ට් ෆුඩ්',
      ta: 'C7. உடனடி உணவுகள் மற்றும் துரித உணவுகள்'
    },
    C7_1: {
      name: {
        en: 'Instant noodles prepared with seasoning flavour sachet',
        si: 'ක්ෂණික නූඩ්ල්ස් (රසකාරක පැකට්ටුව සමඟ සකස් කළ)',
        ta: 'உடனடி நூடுல்ஸ் (சுவையூட்டும் பாக்கெட் உடன்)'
      },
      portion: {
        en: '1 packet (~75g dry)',
        si: 'පැකට් 1ක් (~75g)',
        ta: '1 பாக்கெட் (~75g)'
      }
    },
    C7_2: {
      name: {
        en: 'Kottu roti (vegetable, egg, chicken, beef)',
        si: 'කොත්තු රොටි (එළවළු, බිත්තර, කුකුළු මස්)',
        ta: 'கொத்து ரொட்டி (மரக்கறி, முட்டை, கோழி, மாட்டிறைச்சி)'
      },
      portion: {
        en: '1 regular portion (~350g)',
        si: 'සාමාන්‍ය පංගුවක් (~350g)',
        ta: '1 சாதாரண அளவு (~350g)'
      }
    },
    C7_3: {
      name: {
        en: 'Commercial fried rice (restaurant/canteen style)',
        si: 'ෆ්‍රයිඩ් රයිස් (හෝටල් හෝ කැන්ටින් ක්‍රමයට)',
        ta: 'ஃபிரைடு ரைஸ் (உணவகம்/கேண்டீன் பாணி)'
      },
      portion: {
        en: '1 packet / plate (~350g)',
        si: 'පැකට් 1ක් / පිඟානක් (~350g)',
        ta: '1 பாக்கெட் / தட்டு (~350g)'
      }
    },
    C7_4: {
      name: {
        en: 'Western-style fast food (fried chicken, burgers, fries)',
        si: 'බටහිර පන්නයේ ක්ෂණික ආහාර (ෆ්‍රයිඩ් චිකන්, බර්ගර්, ෆ්‍රයිස්)',
        ta: 'மேற்கத்திய துரித உணவுகள் (பொரித்த கோழி, பர்கர், பிரைஸ்)'
      },
      portion: {
        en: '1 meal',
        si: 'ආහාර වේලක්',
        ta: '1 வேளை உணவு'
      }
    },

    C8: {
      en: 'C8. Dairy Products',
      si: 'C8. කිරි ආශ්‍රිත නිෂ්පාදන',
      ta: 'C8. பால் பொருட்கள்'
    },
    C8_1: {
      name: {
        en: 'Processed cheese / cheese wedges / slices (Happy Cow, Kraft)',
        si: 'සැකසූ චීස් / චීස් කැබලි / පෙති (හැපි කව්, ක්‍රාෆ්ට්)',
        ta: 'பதப்படுத்தப்பட்ட பாலாடைக்கட்டி (சீஸ் துண்டுகள் - Happy Cow, Kraft)'
      },
      portion: {
        en: '1-2 wedges or slices (~25g)',
        si: 'කැබලි හෝ පෙති 1-2ක් (~25g)',
        ta: '1-2 துண்டுகள் (~25g)'
      }
    },
    C8_2: {
      name: {
        en: 'Salted butter or salted table margarine',
        si: 'ලුණු දැමූ බටර් හෝ මේස මාජරින්',
        ta: 'உப்பு சேர்க்கப்பட்ட வெண்ணெய் அல்லது மாஜரின்'
      },
      portion: {
        en: '1 pat or teaspoon (~10g)',
        si: 'තේ හැඳි 1ක් (~10g)',
        ta: '1 தேக்கரண்டி (~10g)'
      }
    }
  };

  // Frequency scale translation mappings
  const FREQ_SCALE_I18N = {
    0: { en: 'Never', si: 'කිසිවිටෙක නැත', ta: 'ஒருபோதும் இல்லை' },
    1: { en: '<1/mo', si: 'මසකට <1', ta: 'மாதத்திற்கு <1' },
    2: { en: '1-3/mo', si: 'මසකට 1-3', ta: 'மாதத்திற்கு 1-3' },
    3: { en: '1/wk', si: 'සතියකට 1', ta: 'வாரத்திற்கு 1' },
    4: { en: '2-4/wk', si: 'සතියකට 2-4', ta: 'வாரத்திற்கு 2-4' },
    5: { en: '5-6/wk', si: 'සතියකට 5-6', ta: 'வாரத்திற்கு 5-6' },
    6: { en: 'Daily', si: 'දිනපතා', ta: 'தினமும்' },
    7: { en: '>1/day', si: 'දිනකට >1', ta: 'நாளுக்கு >1' }
  };

  const KEY_ALIASES = {
    app_tagline: 'appSub',
    nav_overview: 'navDashboard',
    nav_dashboard: 'navDashboard',
    nav_assessment_pipeline: 'navAssessment',
    nav_step1: 'step1',
    nav_step2: 'step2',
    nav_step3: 'step3',
    nav_step4: 'step4',
    nav_research_data: 'navResearch',
    nav_registry: 'navPatients',
    nav_analytics: 'navResearch',
    nav_methodology: 'navAbout',
    lbl_participant_prefix: 'activeParticipant',
    lbl_active_prefix: 'activeParticipant',
    btn_clear: 'btnReset',
    btn_cancel: 'btnCancel',
    step_registration: 'step1',
    step_recall: 'step2',
    step_frequency: 'step3',
    step_results: 'step4',
    title_participant_reg: 'navAssessment',
    title_monthly_questionnaire: 'navMonthly',
    card_reg_title: 'sec0Title',
    card_reg_subtitle: 'sec0Desc',
    banner_privacy_title: 'privacyTitle',
    banner_privacy_desc: 'privacyDesc',
    btn_resume_active: 'btnProceed',
    sec_0_title: 'sec0Title',
    sec_0_desc: 'sec0Desc',
    q01_title: 'q0_1',
    q01_opt_yes: 'q0_1_yes',
    q01_opt_no: 'q0_1_no',
    q02_title: 'q0_2_title',
    q02_subtitle: 'q0_2_subtitle',
    excl_tube_feeding: 'excl_tube',
    excl_swallowing: 'excl_swallow',
    excl_recent_illness: 'excl_illness',
    msg_eligible_criteria: 'eligibleCriteria',
    q03_title: 'q0_3',
    q03_opt_yes: 'q0_3_yes',
    q04_title: 'q0_4',
    q05_title: 'q0_5',
    q05_opt_yes: 'q0_5_yes',
    q05_opt_no: 'q0_5_no',
    q06_title: 'q0_6',
    q06_opt_yes: 'q0_6_yes',
    q06_opt_not_selected: 'q0_6_not_selected',
    sec_a_title: 'secATitle',
    sec_a_desc: 'secADesc',
    lbl_a1_age: 'qA1',
    hint_age: 'qA1_hint',
    lbl_a2_sex: 'qA2',
    opt_select_sex: 'qA2',
    opt_male: 'qA2_male',
    opt_female: 'qA2_female',
    lbl_a3_status: 'qA3',
    opt_uop_academic: 'qA3_academic',
    opt_uop_non_academic: 'qA3_non_academic',
    opt_uop_undergrad: 'qA3_undergrad',
    opt_uop_postgrad: 'qA3_postgrad',
    lbl_a4_faculty: 'qA4',
    lbl_a5_education: 'qA5',
    edu_ol: 'qA5_ol',
    edu_al: 'qA5_al',
    edu_diploma: 'qA5_diploma',
    edu_bachelor: 'qA5_degree',
    edu_postgrad: 'qA5_postgrad',
    lbl_a6_marital: 'qA6',
    marital_single: 'qA6_never',
    marital_married: 'qA6_married',
    marital_other: 'qA6_separated',
    lbl_a7_ethnicity: 'qA7',
    eth_sinhala: 'qA7_sinhala',
    eth_tamil: 'qA7_tamil',
    eth_muslim: 'qA7_muslim',
    eth_burgher: 'qA7_burgher',
    eth_other: 'qA7_other',
    lbl_a8_residence: 'qA8',
    res_own_home: 'qA8_home',
    res_hostel: 'qA8_hostel',
    res_boarding: 'qA8_boarding',
    res_other: 'qA8_other',
    lbl_a9_hypertension: 'qA9',
    lbl_a10_salt_advice: 'qA10',
    badge_physical_measures: 'physicalMeasures',
    sec_anthro_title: 'anthroTitle',
    sec_anthro_desc: 'anthroDesc',
    lbl_height: 'measure_height',
    hint_height: 'heightHint',
    lbl_weight: 'measure_weight',
    hint_weight: 'weightHint',
    lbl_study_group: 'study_cohort',
    lbl_calculated_bmi: 'calc_bmi',
    hint_bmi: 'bmiHint',
    btn_register_proceed: 'btnProceedRecall',
    footer_research_title: 'researchFooter',
    banner_siat_subtitle: 'siatSubtitle',
    banner_siat_title: 'siatTitle',
    banner_siat_desc: 'siatDesc',
    banner_who_target: 'whoTarget',
    provider_model_title: 'providerTitle',
    provider_model_desc: 'providerDesc',
    provider_mode_toggle: 'providerToggle',
    lbl_select_participant_prompt: 'selectParticipantPrompt',
    btn_sync_d1: 'syncD1',
    btn_quick_baseline: 'quickBaseline',
    btn_reset_form: 'btnReset',
    sec_b_title: 'secBTitle',
    sec_b_desc: 'secBDesc',
    sec_c_title: 'secCTitle',
    sec_c_desc: 'secCDesc',
    sec_d_title: 'secDTitle',
    sec_d_desc: 'secDDesc',
    btn_back_recall: 'btnBackRecall',
    btn_save_siat: 'btnSaveMonthly',
    topbar_btn_new: 'newAssessment',
    btn_rerun_assessment: 'rerunAssessment'
  };

  // State Management
  let currentLang = 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      currentLang = saved;
    }
  } catch {
    currentLang = 'en';
  }

  const HALOS_I18N = {
    SUPPORTED_LANGS,
    
    getLanguage() {
      return currentLang;
    },

    setLanguage(lang) {
      if (!SUPPORTED_LANGS.includes(lang)) return;
      currentLang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {}
      document.documentElement.lang = lang;

      // Update active state in all language selectors
      document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Translate static marked elements
      this.applyTranslations();

      // Dispatch global change event on both window and document
      const changeEvt = new CustomEvent('halos:languageChanged', { detail: { language: lang } });
      window.dispatchEvent(changeEvt);
      document.dispatchEvent(new CustomEvent('halos:languageChanged', { detail: { language: lang } }));
    },

    t(key, fallback = '') {
      if (!key) return fallback || '';
      const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
      if (dict && dict[key] !== undefined) {
        return dict[key];
      }
      const alias = KEY_ALIASES[key];
      if (alias) {
        if (dict && dict[alias] !== undefined) return dict[alias];
        if (TRANSLATIONS.en[alias] !== undefined) return TRANSLATIONS.en[alias];
      }
      const enDict = TRANSLATIONS.en;
      return (enDict && enDict[key] !== undefined) ? enDict[key] : (fallback || key);
    },

    getSectionCItem(key) {
      const item = SECTION_C_I18N[key];
      if (!item) return null;
      if (item.name && item.portion) {
        return {
          name: item.name[currentLang] || item.name.en,
          portion: item.portion[currentLang] || item.portion.en
        };
      }
      return {
        title: item[currentLang] || item.en
      };
    },

    getFreqScaleLabel(val) {
      const entry = FREQ_SCALE_I18N[val];
      return entry ? (entry[currentLang] || entry.en) : String(val);
    },

    // Apply translations to all DOM elements with data-i18n attributes
    applyTranslations() {
      // 1. Plain text replacement
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = this.t(key);
        if (text) {
          el.textContent = text;
        }
      });

      // 2. HTML replacement (for text with spans / tags)
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const html = this.t(key);
        if (html) {
          el.innerHTML = html;
        }
      });

      // 3. Placeholder attribute
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = this.t(key);
        if (text) {
          el.placeholder = text;
        }
      });

      // 4. Update Select Options that have data-i18n-opt
      document.querySelectorAll('option[data-i18n-opt]').forEach(opt => {
        const key = opt.getAttribute('data-i18n-opt');
        const text = this.t(key);
        if (text) {
          opt.textContent = text;
        }
      });

      // 5. Update Stepper labels if present
      const stepLabels = document.querySelectorAll('.step-node .step-label');
      if (stepLabels.length >= 4) {
        stepLabels[0].textContent = this.t('step1');
        stepLabels[1].textContent = this.t('step2');
        stepLabels[2].textContent = this.t('step3');
        stepLabels[3].textContent = this.t('step4');
      }

      // 6. Update Navigation links
      const navMapping = [
        { selector: 'a[href="/index.html"]', key: 'navDashboard' },
        { selector: 'a[href="/assessment.html"]', key: 'navAssessment' },
        { selector: 'a[href="/dietary-recall.html"]', key: 'navRecall' },
        { selector: 'a[href="/monthly-questionnaire.html"]', key: 'navMonthly' },
        { selector: 'a[href="/results.html"]', key: 'navResults' },
        { selector: 'a[href="/patients.html"]', key: 'navPatients' },
        { selector: 'a[href="/research-dashboard.html"]', key: 'navResearch' },
        { selector: 'a[href="/about.html"]', key: 'navAbout' },
        { selector: 'a[href="/login.html"]', key: 'navLogin' }
      ];

      navMapping.forEach(item => {
        document.querySelectorAll(`.sidebar-nav ${item.selector}`).forEach(link => {
          const svg = link.querySelector('svg');
          const badge = link.querySelector('.nav-lock-badge');
          const text = this.t(item.key);
          if (text) {
            // Rebuild link content preserving svg & lock badge
            link.innerHTML = '';
            if (svg) link.appendChild(svg);
            link.appendChild(document.createTextNode(' ' + text + ' '));
            if (badge) link.appendChild(badge);
          }
        });
      });
    },

    // Render the language selector widget
    renderLanguageSwitcher(targetContainer) {
      if (!targetContainer) return;
      
      // Avoid duplicate render
      if (targetContainer.querySelector('.halos-lang-selector')) return;

      const wrap = document.createElement('div');
      wrap.className = 'halos-lang-selector';
      wrap.innerHTML = `
        <div class="lang-pill-group" role="group" aria-label="Select Language">
          <button type="button" class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" title="English">
            <span class="lang-code">EN</span>
            <span class="lang-text">English</span>
          </button>
          <button type="button" class="lang-btn ${currentLang === 'si' ? 'active' : ''}" data-lang="si" title="සිංහල (Sinhala)">
            <span class="lang-code">සිං</span>
            <span class="lang-text">සිංහල</span>
          </button>
          <button type="button" class="lang-btn ${currentLang === 'ta' ? 'active' : ''}" data-lang="ta" title="தமிழ் (Tamil)">
            <span class="lang-code">தமி</span>
            <span class="lang-text">தமிழ்</span>
          </button>
        </div>
      `;

      wrap.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const selected = btn.getAttribute('data-lang');
          this.setLanguage(selected);
        });
      });

      targetContainer.appendChild(wrap);
    },

    // Auto-mount into topbar
    init() {
      document.documentElement.lang = currentLang;

      // First check any explicit .halos-lang-mount containers
      const explicitMounts = document.querySelectorAll('.halos-lang-mount');
      if (explicitMounts.length > 0) {
        explicitMounts.forEach(mount => this.renderLanguageSwitcher(mount));
      }

      // Find topbar or header right container
      const topbarRight = document.querySelector('.topbar-right');
      if (topbarRight && !topbarRight.querySelector('.halos-lang-selector')) {
        // Create container if not exists
        let langMount = topbarRight.querySelector('#topbar-lang-mount');
        if (!langMount) {
          langMount = document.createElement('div');
          langMount.id = 'topbar-lang-mount';
          langMount.style.marginRight = '8px';
          topbarRight.insertBefore(langMount, topbarRight.firstChild);
        }
        this.renderLanguageSwitcher(langMount);
      } else {
        // Fallback: check editorial header on login or public app
        const headerRight = document.querySelector('header .flex.items-center.gap-4');
        if (headerRight && !headerRight.querySelector('.halos-lang-selector')) {
          const langMount = document.createElement('div');
          langMount.id = 'header-lang-mount';
          headerRight.insertBefore(langMount, headerRight.firstChild);
          this.renderLanguageSwitcher(langMount);
        }
      }

      // Apply translations immediately
      this.applyTranslations();
    }
  };

  // Expose globally
  window.HALOS_I18N = HALOS_I18N;

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HALOS_I18N.init());
  } else {
    HALOS_I18N.init();
  }
})();
