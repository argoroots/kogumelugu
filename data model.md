## Story
- language <- ***Chapter.language***
- tellingDate(s) <- ***Chapter.tellingDate***
- project (PROJEKT) -> ***Project***
- category (KATEGOORIA) -> ***Category***
- tag(s) <- ***Chapter.tag***
- legend (LISAINFO)

## Interview
- date (AASTA, SALVESTUSKUUPÄEV(AD))
- language (KEEL)
- storyteller(s) (LOORÄÄKIJAD) -> ***Storyteller***
- titleShort (INTERVJUU PEALKIRI (lühike))
- titleLong (INTERVJUU PEALKIRI (pikk))
- recordingLocation (KOGUMISE / SALEVESTUSE TOIMUMISKOHT)
- timecodedSubjects (INTERVJUUS KÄSITLETUD TEEMAD AJAKOODIDEGA)

## Chapter
- story -> ***Story***
- photo
- videoUrl (VIDEOLOO LINK YOUTUBE-is)
- videoLength
- storyteller(s) (LOORÄÄKIJAD) -> ***Storyteller***
- description (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL)
- mentions (MAINITUD ISIKUD)
- region(s) (MAINITUD PIIRKONNAD) -> ***Region***
- author (VIDEOLOO AUTOR) -> ***Author***
- tag (YOUTUBE SILDID)
- timecodedText (ÕPPEKAVAGA SEOTUD MÄRKSÕNAD / MÕISTED AJAKOODIDEGA)

## Storyteller
- email (LOORÄÄKIJA KONTAKT)
- phone (LOORÄÄKIJA KONTAKT)
- birthYear (LOO RÄÄKIJA SÜNNIAEG)
- name (LOORÄÄKIJAD)
- tuntud inimene? (TUNTUD INIMENE?)
- background (SOTSIAALNE TAUST)

## Author
- email
- phone
- name

## Project
- name

## Category
- name

## Region
- name
- fullName
- parent -> ***Region***

### Originaalväljad
- REGISTRI NR - N/A
- AASTA == ***Interview.tellingDate***
- KEEL == ***Interview.language***
- PROJEKT == ***Story.project***
- KATEGOORIA == ***Story.category***
- LOORÄÄKIJAD == ***Chapter.storyteller***, ***Interview.storyteller***
- TUNTUD INIMENE? == ***Storyteller.tuntud inimene***
- LOO RÄÄKIJA SÜNNIAEG == ***Storyteller.birthYear***
- LOORÄÄKIJA KONTAKT == ***Storyteller.email/.phone***
- INTERVJUU PEALKIRI (pikk) == ***Interview.titleShort***
- INTERVJUU PEALKIRI (lühike) == ***Interview.titleLong***
- LÜHIKIRJELDUS == ***Chapter.description***
- LÜHIKIRJELDUSE KEEL == ***Chapter.description***
- KOGUMISE / SALEVESTUSE TOIMUMISKOHT == ***Interview.recordingLocation***
- ANDMEFORMAAT - kõik on video tüüpi?
- SALVESTISE ORIGINAALFORMAAT - oluline?
- BROADCAST STANDARD - oluline?
- "SALVESTUSKUUPÄEV
  - tervik  
    AAAA-KK-PP formaat" == ***Interview.date***
  - VÕI
  - "SALVESTUSKUUPÄEVAD
    - alguskuupäev  
      AAAA-KK-PP formaat" == ***Interview.date***
    - lõppkuupäev  
      AAAA-KK-PP formaat" == ***Interview.date***
- MAINITUD ISIKUD == ***Chapter.mentions***
- MAINITUD PIIRKONNAD == ***Chapter.region***
- SOTSIAALNE TAUST == ***Storyteller.background***
- VIDEOLOO AUTOR == ***Chapter.author***
- VIDEOLOO PEALKIRI == ***Chapter.title***
- VIDEOLOO LINK YOUTUBE-is == ***Chapter.videoUrl (VIDEOLOO LINK YOUTUBE-is)***
- INTERVJUUS KÄSITLETUD TEEMAD AJAKOODIDEGA == ***Interview.timecodedSubjects***
- ÕPPEKAVAGA SEOTUD MÄRKSÕNAD / MÕISTED AJAKOODIDEGA == ***Chapter.timecodedText***
- KANAL
- YOUTUBE SILDID == ***Chapter.tag***
- LISAINFO == ***Story.legend***
