module.exports = {
  scope: 'papyr',
  name: 'products-repository',
  dependencies: ['Product'],
  factory: (Product) => {
    'use strict'

    const find = (query) => {
      return getMockProducts()
        .then((products) => {
          return products.filter((product) => {
            const q = query.toLowerCase()

            return product.uid.indexOf(q) > -1 ||
              product.description.indexOf(q) > -1 ||
              (product.metadata.keywords &&
                product.metadata.keywords.indexOf(q) > -1)
          })
          .map((product) => new Product(product))
        })
    }

    const get = (uid) => {
      return getMockProducts()
        .then((products) => {
          return products.filter((product) =>
            product.uid === uid
          )
        }).then((products) => {
          if (products.length) {
            return products[0]
          }

          throw new Error(`Book with id, ${uid} not found`)
        })
    }

    return Object.freeze({ find, get })
  }
}

function getMockProducts () {
  return Promise.resolve([{
    "_id": "5623c1263b952eb796d79df7",
    "uid": "before_go",
    "title": "One Last Thing Before I Go",
    "description": "“Mistakes have been made.” Drew Silver has begun to accept that life isn’t going to turn out as he expected. His fleeting fame as the drummer for a one-hit wonder rock band is nearly a decade behind him. His ex-wife is about to marry a terrific guy. And his Princeton-bound teenage daughter Casey has just confided in him that she’s pregnant—because Silver is the one she cares least about letting down.",
    "metadata": {
      "authors": [{
        "name": "Jonathan Tropper"
      }]
    },
    "price": 8.77,
    "thumbnailLink": "/images/books/beforeIGo.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79df8",
    "uid": "bend_of_the_world",
    "title": "The Bend of the World: A Novel",
    "description": "In the most audacious literary debut to come out of the Steel City since The Mysteries of Pittsburgh, we meet Peter Morrison, twenty-nine and comfortably adrift in a state of not-quite-adulthood, less concerned about the general direction of his life than with his suspicion that all his closest relationships are the products of inertia. He and his girlfriend float along in the same general direction, while his parents are acting funny, though his rich, hypochondriac grandmother is still good for admission to the better parties. He spends his days clocking into Global Solutions (a firm whose purpose remains unnervingly ambiguous) and his weekends listening to the half-imagined rants of his childhood best friend, Johnny.",
    "metadata": {
      "authors": [{
        "name": "Jacob Bacharach"
      }]
    },
    "price": 12.99,
    "thumbnailLink": "/images/books/bendOfTheWorld.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79df9",
    "uid": "dependency_injection",
    "title": "Dependency Injection in .NET",
    "description": "Dependency Injection in .NET, winner of the 2013 Jolt Awards for Productivity, presents core DI patterns in plain C#, so you'll fully understand how DI works, covers integration with standard Microsoft technologies like ASP.NET MVC, and teaches you to use DI frameworks like Structure Map, Castle Windsor, and Unity.",
    "metadata": {
      "authors": [{
        "name": "Mark Seemann"
      }]
    },
    "price": 32.16,
    "thumbnailLink": "/images/books/dependencyInjection.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79dfa",
    "uid": "dirk_gentlys_detective_agency",
    "title": "Dirk Gently's Holistic Detective Agency",
    "description": "There is a long tradition of Great Detectives, and Dirk Gently does not belong to it. But his search for a missing cat uncovers a ghost, a time traveler, AND the devastating secret of humankind! Detective Gently's bill for saving the human race from extinction: NO CHARGE.",
    "metadata": {
      "authors": [{
        "name": "Douglas Adams"
      }]
    },
    "price": 6.83,
    "thumbnailLink": "/images/books/dirkgently.jpeg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79dfb",
    "uid": "four_gifts",
    "title": "The Four Gifts",
    "description": "For more than fourteen centuries the Aunorian Empire has united mankind. Under the absolute rule of its emperors a global society was established, but that society is waning. The authority of the emperors has been slowly stripped away, and power now rests in the hands of a bloated bureaucracy and a rapidly expanding intelligence organization. As a long complacent public finally awakens to this decay, ambitious elites fight for control and push the Empire further towards collapse.",
    "metadata": {
      "authors": [{
        "name": "Chance Nirmaier"
      }]
    },
    "price": 2.99,
    "thumbnailLink": "/images/books/fourgifts.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79dfc",
    "uid": "hitchhikers_guide_galaxy",
    "title": "The Hitchhiker's Guide to the Galaxy",
    "description": "Seconds before the Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet by his friend Ford Prefect, a researcher for the revised edition of The Hitchhiker's Guide to the Galaxy who, for the last fifteen years, has been posing as an out-of-work actor. Together this dynamic pair begin a journey through space aided by quotes from The Hitchhiker's ",
    "metadata": {
      "authors": [{
        "name": "Douglas Adams"
      }],
      "keywords": [
        "hitchhiker"
      ]
    },
    "price": 4.59,
    "thumbnailLink": "/images/books/hitchiker.jpeg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79dfd",
    "uid": "leave_you",
    "title": "This Is Where I Leave You: A Novel",
    "description": "The death of Judd Foxman's father marks the first time that the entire Foxman clan has congregated in years. There is, however, one conspicuous absence: Judd's wife, Jen, whose affair with his radio- shock-jock boss has recently become painfully public. Simultaneously mourning the demise of his father and his marriage, Judd joins his dysfunctional family as they reluctantly sit shiva-and spend seven days and nights under the same roof. The week quickly spins out of control as longstanding grudges resurface, secrets are revealed and old passions are reawakened. Then Jen delivers the clincher: she's pregnant.",
    "metadata": {
      "authors": [{
        "name": "Jonathan Tropper"
      }]
    },
    "price": 7.99,
    "thumbnailLink": "/images/books/whereILeaveYou.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79dfe",
    "uid": "lost_for_words",
    "title": "Lost For Words: A Novel",
    "description": "Edward St. Aubyn’s Patrick Melrose novels were some of the most celebrated works of fiction of the past decade. Ecstatic praise came from a wide range of admirers, from literary superstars such as Zadie Smith, Francine Prose, Jeffrey Eugenides, and Michael Chabon to pop-culture icons such as Anthony Bourdain and January Jones. Now St. Aubyn returns with a hilariously smart send-up of a certain major British literary award.",
    "metadata": {
      "authors": [{
        "name": "Edward St. Aubyn"
      }]
    },
    "price": 11.04,
    "thumbnailLink": "/images/books/lostForWords.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79dff",
    "uid": "restaurant_at_end_universe",
    "title": "The Restaurant at the End of the Universe",
    "description": "Facing annihilation at the hands of the warlike Vogons is a curious time to have a craving for tea. It could only happen to the cosmically displaced Arthur Dent and his curious comrades in arms as they hurtle across space powered by pure improbability--and desperately in search of a place to eat.",
    "metadata": {
      "authors": [{
        "name": "Douglas Adams"
      }],
      "keywords": [
        "hitchhiker",
        "hitchhiker's guide to the galaxy"
      ]
    },
    "price": 6.83,
    "thumbnailLink": "/images/books/restaurantuniverse.jpeg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e00",
    "uid": "rise_and_fall",
    "title": "The Rise & Fall of Great Powers: A Novel",
    "description": "Following one of the most critically acclaimed fiction debuts in years, New York Times bestselling author Tom Rachman returns with a brilliant, intricately woven novel about a young woman who travels the world to make sense of her puzzling past.",
    "metadata": {
      "authors": [{
        "name": "Tom Rachman"
      }]
    },
    "price": 11.84,
    "thumbnailLink": "/images/books/riseAndFall.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e01",
    "uid": "siddhartha",
    "title": "Siddhartha",
    "description": "Originally published in 1922, Hermann Hesse’s Siddhartha tells the story of a young Indian man’s spiritual journey. After meeting the Buddha, young Siddhartha searches for the ultimate reality and meaning of life. His journey takes him from the arms of a beautiful courtesan to monastic simplicity, from being a son to having his own son, and finally to the true beginning of his life beside a river where he ultimately finds wisdom.",
    "metadata": {
      "authors": [{
        "name": "Herman Hesse"
      }],
      "keywords": [
        "India",
        "Indian"
      ]
    },
    "price": 0.99,
    "thumbnailLink": "/images/books/siddhartha.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e02",
    "uid": "still_life_with_woodpecker",
    "title": "Still Life with Woodpecker",
    "description": "Still Life with Woodpecker is a sort of a love story that takes place inside a pack of Camel cigarettes. It reveals the purpose of the moon, explains the difference between criminals and outlaws, examines the conflict between social activism and romantic individualism, and paints a portrait of contemporary society that includes powerful Arabs, exiled royalty, and pregnant cheerleaders. It also deals with the problem of redheads.",
    "metadata": {
      "authors": [{
        "name": "Tom Robbins"
      }]
    },
    "price": 9.99,
    "thumbnailLink": "/images/books/woodpecker.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e03",
    "uid": "swamplandia",
    "title": "Swamplandia",
    "description": "From the celebrated twenty-nine-year-old author of the everywhere-heralded short-story collection St. Lucy’s Home for Girls Raised by Wolves (“How I wish these were my own words, instead of the breakneck demon writer Karen Russell’s . . . Run for your life. This girl is on fire”—Los Angeles Times Book Review) comes a blazingly original debut novel that takes us back to the swamps of the Florida Everglades, and introduces us to Ava Bigtree, an unforgettable young heroine.",
    "metadata": {
      "authors": [{
        "name": "Karen Russell"
      }],
      "keywords": [
        "swamp"
      ]
    },
    "price": 9.99,
    "thumbnailLink": "/images/books/swamplandia.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e04",
    "uid": "tibetan_peach_pie",
    "title": "Tibetan Peach Pie: A True Account of an Imaginative Life",
    "description": "In Tibetan Peach Pie, Robbins turns that unparalleled literary sensibility inward, stitching together stories of his unconventional life, from his Appalachian childhood to his globetrotting adventures —told in his unique voice that combines the sweet and sly, the spiritual and earthy. The grandchild of Baptist preachers, Robbins would become over the course of half a century a poet-interruptus, an air force weatherman, a radio dj, an art-critic-turned-psychedelic-journeyman, a world-famous novelist, and a counter-culture hero, leading a life as unlikely, magical, and bizarre as those of his quixotic characters.",
    "metadata": {
      "authors": [{
        "name": "Tom Robbins"
      }]
    },
    "price": 12.74,
    "thumbnailLink": "/images/books/tibetanPeachPie.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e05",
    "uid": "universe_everything",
    "title": "Life, the Universe and Everything",
    "description": "The unhappy inhabitants of planet Krikkit are sick of looking at the night sky above their heads--so they plan to destroy it. The universe, that is. Now only five individuals stand between the white killer robots of Krikkit and their goal of total annihilation.",
    "metadata": {
      "authors": [{
        "name": "Douglas Adams"
      }],
      "keywords": [
        "hitchhiker",
        "hitchhiker's guide to the galaxy"
      ]
    },
    "price": 5.99,
    "thumbnailLink": "/images/books/lifeandeverything.jpeg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e06",
    "uid": "visit_from_goon_squad",
    "title": "A Visit From the Goon Squad",
    "description": "Jennifer Egan’s spellbinding interlocking narratives circle the lives of Bennie Salazar, an aging former punk rocker and record executive, and Sasha, the passionate, troubled young woman he employs. Although Bennie and Sasha never discover each other’s pasts, the reader does, in intimate detail, along with the secret lives of a host of other characters whose paths intersect with theirs, over many years, in locales as varied as New York, San Francisco, Naples, and Africa.",
    "metadata": {
      "authors": [{
        "name": "Jennifer Egan"
      }]
    },
    "price": 9.77,
    "thumbnailLink": "/images/books/goonSquad.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e07",
    "uid": "white_tiger",
    "title": "The White Tiger: A Novel",
    "description": "A stunning literary debut critics have likened to Richard Wright’s Native Son, The White Tiger follows a darkly comic Bangalore driver through the poverty and corruption of modern India’s caste society. “This is the authentic voice of the Third World, like you've never heard it before” (John Burdett, Bangkok 8).",
    "metadata": {
      "authors": [{
        "name": "Aravind Adiga"
      }],
      "keywords": [
        "India",
        "Indian"
      ]
    },
    "price": 8.62,
    "thumbnailLink": "/images/books/whiteTiger.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e08",
    "uid": "wild",
    "title": "Wild: From Lost To Found on the Pacific Coast Trail",
    "description": "At twenty-two, Cheryl Strayed thought she had lost everything. In the wake of her mother’s death, her family scattered and her own marriage was soon destroyed. Four years later, with nothing more to lose, she made the most impulsive decision of her life: to hike the Pacific Crest Trail from the Mojave Desert through California and Oregon to Washington State “and to do it alone. She had no experience as a long-distance hiker, and the trail was little more than an idea, vague and outlandish and full of promise. But it was a promise of piecing back together a life that had come undone.",
    "metadata": {
      "authors": [{
        "name": "Cheryl Strayed"
      }]
    },
    "price": 6.99,
    "thumbnailLink": "/images/books/wild.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e09",
    "uid": "wild_ducks",
    "title": "Wild Ducks Flying Backward",
    "description": "Whether he is rocking with the Doors, depoliticizing Picasso’s Guernica, lamenting the angst-ridden state of contemporary literature, or drooling over tomato sandwiches and a species of womanhood he calls “the genius waitress,” Robbins’s briefer writings often exhibit the same five traits that perhaps best characterize his novels: an imaginative wit, a cheerfully brash disregard for convention, a sweetly nasty eroticism, a mystical but keenly observant eye, and an irrepressible love of language.",
    "metadata": {
      "authors": [{
        "name": "Tom Robbins"
      }]
    },
    "price": 9.41,
    "thumbnailLink": "/images/books/flyingBackward.jpg",
    "type": "book"
  }, {
    "_id": "5623c1263b952eb796d79e0a",
    "uid": "yellow_sun",
    "title": "Half of a Yellow Sun",
    "description": "With effortless grace, celebrated author Chimamanda Ngozi Adichie illuminates a seminal moment in modern African history: Biafra's impassioned struggle to establish an independent republic in southeastern Nigeria during the late 1960s. We experience this tumultuous decade alongside five unforgettable characters: Ugwu, a thirteen-year-old houseboy who works for Odenigbo, a university professor full of revolutionary zeal; Olanna, the professor’s beautiful young mistress who has abandoned her life in Lagos for a dusty town and her lover’s charm; and Richard, a shy young Englishman infatuated with Olanna’s willful twin sister Kainene. Half of a Yellow Sun is a tremendously evocative novel of the promise, hope, and disappointment of the Biafran war.",
    "metadata": {
      "authors": [{
        "name": "Chimamanda Ngozi Adichie"
      }]
    },
    "price": 8.99,
    "thumbnailLink": "/images/books/yellowSun.jpg",
    "type": "book"
  }])
}