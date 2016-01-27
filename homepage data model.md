# Hierarchy

- Project (keegi väljast ei näe, rahastus, lepingud)
    - Interview
    - Story / videolugu

# Definitions

## Project
- name
- code (võibla me ei kasutagi koode)
- projekti lepingu alguse aasta
- kirjeldus



## Interview
Täispikk videointervjuu, milles vestja räägib oma loo.
- photo
- date(s) (AASTA, SALVESTUSKUUPÄEV(AD))
- category (KATEGOORIA) -> ***Category***
- language (KEEL)
- storyteller(s) (LOORÄÄKIJAD) -> ***Person***
- title / **multilingual** - paneme kokku
    - titleShort:public (INTERVJUU PEALKIRI (lühike))
    - titleLong:private (INTERVJUU PEALKIRI (pikk))
- recordingLocation (KOGUMISE / SALEVESTUSE TOIMUMISKOHT)
- description - est (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL) + (LISAINFO)
- description - eng (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL) + (LISAINFO)
- description - rus (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL) + (LISAINFO)
- timecodedSubjects / **multilingual** (INTERVJUUS KÄSITLETUD TEEMAD AJAKOODIDEGA)
- timecodedCurriculum (ÕPPEKAVAGA SEOTUD MÄRKSÕNAD / MÕISTED AJAKOODIDEGA)
- mention(s) (MAINITUD ISIKUD) -> ***Person***
- region(s) (MAINITUD PIIRKONNAD) -> ***Region***
- tag (YOUTUBE SILDID) -> ***Tag***
- lookup property: story -> ***self.Story***
- lookup property: project -> ***self.Project***
- videoUrl
- author (VIDEOLOO AUTOR) -> ***Person***


Supakate keel valida siit:  [vimeo supakad](https://vimeo.com/help/faq/managing-your-videos/captions-and-subtitles#what-caption-and-subtitle-file-formats-does-vimeo-support)  
ja oleks hea, kui see sobiks ka muude ajakodeeritud väljade jaoks.
## Story
- photo
- category (KATEGOORIA) -> ***Category***
- language(s) - keeled, mida kasutatakse jutus
- subtitles - est
- subtitles - eng
- subtitles - rus
- lookup property: project (PROJEKT) -> ***self.Project***
- interview(s) -> ***Interview***
- tag(s) -> ***Tag***
- description - est (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL) + (LISAINFO)
- description - eng (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL) + (LISAINFO)
- description - rus (LÜHIKIRJELDUS, LÜHIKIRJELDUSE KEEL) + (LISAINFO)
- videoUrl (VIDEOLOO LINK YOUTUBE-is)
- storyteller(s) (LOORÄÄKIJAD) -> ***Person***
- author -> ***Person***


## Tag
- name


## Category
- code (võibla me ei kasutagi koode)
- name
- color
- description


## Storyteller on hoopis Person
- email (LOORÄÄKIJA KONTAKT)
- phone (LOORÄÄKIJA KONTAKT)
- birthYear (LOO RÄÄKIJA SÜNNIAEG)
- name (LOORÄÄKIJAD)
- description (SOTSIAALNE TAUST)

## Author on hoopis Person
- email
- phone
- name

## Region
- name
- fullName (Kogu asukoha hierarhiline rada)
- parent -> ***Region***

### Originaalväljad
- REGISTRI NR - N/A
- AASTA == ***Interview.tellingDate***
- KEEL == ***Interview.language***
- PROJEKT == ***Story.project***
- KATEGOORIA == ***Story.category***
- LOORÄÄKIJAD == ***Chapter.storyteller***, ***Interview.storyteller***
- TUNTUD INIMENE? == kaob ära
- LOO RÄÄKIJA SÜNNIAEG == ***Storyteller.birthYear***
- LOORÄÄKIJA KONTAKT == ***Storyteller.email/.phone***
- INTERVJUU PEALKIRI (pikk) == ***Interview.title***
- INTERVJUU PEALKIRI (lühike) == ***Interview.title***
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




---

## Toetajad
- name
- logo
- link
