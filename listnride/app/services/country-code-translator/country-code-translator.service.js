'use strict';

angular.module('listnride')
  .factory('countryCodeTranslator', ['$translate', function ($translate) {

    var data = [
      {
        "countryCode": "DE",
        "countryNames": ["alamagn", "alemaña", "alemanha", "alémani", "alemania", "alemanne", "alemantlān", "alemanya", "alimaña", "alimanya", "allemagne", "allemangne", "allemogne", "yr almaen", "alman", "almānīya", "almaniya", "almanya", "almayn", "ashkenaz", "אשכנז", "däitschland", "daytshland", "דײַטשלאַנד", "déguó", "德國", "德国", "deitschland", "deutän", "deutschland", "déyìzhì", "德意志", "ditschlånd", "dogil", "togil", "독일", "doitsu", "ドイツ", "独逸", "獨乙", "dotygu'e", "đức quốc or đức", "duiska", "duitsland", "dútslân", "düütschland", "duutslaand", "duutsland", "ǧarman", "ጀርመን", "german", "герман", "germani", "германи", "germania", "գերմանիա", "germania", "გერმანია", "germanía", "γερμανία", "germania", "germània", "zermània", "germanija", "германија", "germanio", "germaniya", "гepмaния", "germaniya", "גרמניה", "germaniya", "ӂермания", "gérmaniye", "گېرمانىيە", "германийә", "il-ġermanja", "germany", "a' ghearmailt", "an ghearmáin", "ghirmânii", "girmania", "gjermania", "gjermanie", "jaamaluvik", "jarmal", "jarmaniya", "ජර්මනිය", "jemani", "jermani", "jerman", "jérman", "jermani", "jeureuman", "nemačka", "немачка", "nemčija", "německo", "nemecko", "németország", "niemcy", "nimechchyna", "німеччина", "nimska", "njamiechchyna", "нямеччына", "njemačka", "saksa", "saksamaa", "s'aksamaa", "siaman or siamani", "švapska", "швапска", "tek-kok", "terra tudestga", "þēodiscland", "þýskaland", "tiamana", "tôitšhi", "tyskland", "týskland", "ujerumani", "vācija", "vokietija", "yoeramani", "เยอรมนี", "ஜெர்மனி", "germany", "جرمنی", "জার্মানি", "jarmani"]
      },
      {
        "countryCode": "AT",
        "countryNames": ["afstría", "αυστρία", "an ostair", "áo", "àodìlì", "奧地利", "奥地利", "àoguó", "奧國", "奥国", "aostria", "oshtriya", "অস্ট্রিয়া", "āsṭriyā", "ఆస్ట్రియా", "āsṫriyā", "اسٹریا", "austri", "austria", "àustria", "áustria", "austrija", "austrija", "аустрија", "aŭstrio", "aŭstrujo", "aŭstryja", "аўстрыя", "austurríki", "ausuturia", "ausztria", "autriche", "avstria", "ավստրիա", "avstria", "ავსტრია", "avstrija", "avstrija", "австрия", "avstrija", "австрија", "avstriya", "австрія", "avusturya", "awstiriya", "awstria", "l-awstrija", "awstriska", "eastenryk", "estraykh", "עסטרײַך", "eysturríki", "itävalta", "nimsā", "النمسا", "oostenrijk", "oostenryk", "öösterriek", "oseuteuria", "osŭt'ŭria", "오스트리아", "österreich", "østerrike", "österrike", "ostria", "ออสเตรีย", "østrig", "osṭriyā", "ઓસ્ટ્રિયા", "ostriya", "אוסטריה", "osṭriyā", "ओस्ट्रिया", "ostriyawa", "ඔස්ට්රියාව", "ōsutoria", "オーストリア", "ōsutorī", "オーストリー", "otrish", "اتریش", "rakousko", "rakúsko", "rakuzy", "ஆஸ்திரியா", "astria", "আস্ট্রিয়া"]
      }
    ];

    var countryCodeFor = function (countryName) {
      var countryCode = undefined;
      _(data).each(function (el) {
        if (el.countryNames.indexOf(countryName.toLocaleLowerCase()) > -1) {
          countryCode = el.countryCode;
          return;
        }
      });
      return countryCode;
    };

    return {
      countryCodeFor: countryCodeFor
    }

  }
]);
