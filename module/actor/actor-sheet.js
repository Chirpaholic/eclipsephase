import * as Dice from "../dice.js"
import { eclipsephase } from "../config.js"
import { registerEffectHandlers,registerCommonHandlers,itemCreate,registerItemHandlers } from "../common/common-sheet-functions.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class EclipsePhaseActorSheet extends ActorSheet {

    constructor(...args) {
      super(...args);
      
      const showEverything = game.settings.get("eclipsephase", "showEverything");
      console.log(this);
      if(showEverything){
        this.position.height = 900;
        this.position.width = 800;
      }
      else {
        if (!game.user.isGM && !this.actor.isOwner){
          this.position.height = 575;
          this.position.width = 800;
        }
        else{
          this.position.height = 900;
          this.position.width = 800;
        }
      }
    }

    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["eclipsephase", "sheet", "actor"],
        resizable: false,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
      });
    }

  /** @override */

  get template() {
    const showEverything = game.settings.get("eclipsephase", "showEverything");
    if (showEverything){
      return "systems/eclipsephase/templates/actor/actor-sheet.html"
    }
    else{
      if (!game.user.isGM && !this.actor.isOwner){
        return "systems/eclipsephase/templates/actor/sheet-limited.html";
      }
      else{
        return "systems/eclipsephase/templates/actor/actor-sheet.html";
      }
    }
  }

  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    // Prepare items.
    if(data.data.img === "icons/svg/mystery-man.svg"){
      data.data.img = "systems/eclipsephase/resources/img/anObjectificationByMichaelSilverRIP.jpg";
    }

    eclipsephase.morphNames.forEach(name => {
      if(data.data.data.bodies[name].img === ""){
        data.data.data.bodies[name].img = "systems/eclipsephase/resources/img/anObjectificationByMichaelSilverRIP.jpg";
      }
    })

    if (data.data.type === 'character') {
      this._prepareCharacterItems(data);
    }

    //Prepare dropdowns
    data.config = CONFIG.eclipsephase;

    return data;
  }

  //Binds morphFlaws/Traits/Gear to a singular morph
  async _onDropItemCreate(itemData) {

    // Create a Consumable spell scroll on the Inventory tab
    if (itemData.type === "morphFlaw" || itemData.type === "morphTrait" || itemData.type === "ware") {
      let actor = this.actor;
      let actorData = actor.data.data;
      let currentMorph = actorData.bodies.activeMorph
      let data = itemData.data;
      data.boundTo = currentMorph;
    }

    // Create the owned item as normal
    return super._onDropItemCreate(itemData);
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
 async _prepareCharacterItems(sheetData) {
    const actorData = sheetData.data;
    const data = actorData.data;

    // Initialize containers.

    const gear = [];
    const know = [];
    const special = [];
    const trait = [];
    const flaw = [];
    const effects = [];
    const morphtrait = {
        morph1: [],
        morph2: [],
        morph3: [],
        morph4: [],
        morph5: [],
        morph6: []
    };
    const morphflaw = {
        morph1: [],
        morph2: [],
        morph3: [],
        morph4: [],
        morph5: [],
        morph6: []
    };
    const rangedweapon = [];
    const ccweapon = [];
    const armor = [];
    const ware = {
        morph1: [],
        morph2: [],
        morph3: [],
        morph4: [],
        morph5: [],
        morph6: []
    };
      const aspect = {
          Chi: [],
          Gamma: []
      };
      const program = [];
      const vehicle = {
          Robot: [],
          Vehicle: [],
          Morph: []
      };
    const item = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to features.
      if (i.type === 'specialSkill') {
        let aptSelect = 0;
        if (i.data.aptitude === "Intuition") {
          aptSelect = data.aptitudes.int.value;
        }
        else if (i.data.aptitude === "Cognition") {
          aptSelect = data.aptitudes.cog.value;
        }
        else if (i.data.aptitude === "Reflexes") {
          aptSelect = data.aptitudes.ref.value;
        }
        else if (i.data.aptitude === "Somatics") {
          aptSelect = data.aptitudes.som.value;
        }
        else if (i.data.aptitude === "Willpower") {
          aptSelect = data.aptitudes.wil.value;
        }
        else if (i.data.aptitude === "Savvy") {
          aptSelect = data.aptitudes.sav.value;
        }
        i.roll = Number(i.data.value) + aptSelect;
        i.specroll = Number(i.data.value) + aptSelect + 10;
        special.push(i);
        }
        else if (i.type === 'knowSkill') {
          let aptSelect = 0;
          if (i.data.aptitude === "Intuition") {
            aptSelect = data.aptitudes.int.value;
          }
          else if (i.data.aptitude === "Cognition") {
            aptSelect = data.aptitudes.cog.value;
          }
          i.roll = Number(i.data.value) + aptSelect;
          i.specroll = Number(i.data.value) + aptSelect + 10;
          know.push(i);
        }
        else if (i.type === 'trait') {
          trait.push(i);
        }
        else if (i.type === 'flaw') {
          flaw.push(i);
        }
        else if (i.data.displayCategory === 'ranged') {
          rangedweapon.push(i);
        }
        else if (i.data.displayCategory === 'ccweapon') {
          ccweapon.push(i);
        }
        else if (i.data.displayCategory === 'armor') {
          armor.push(i);
        }
        else if (i.type === 'aspect') {
          aspect[i.data.psiType].push(i);
        }
        else if (i.type === 'program') {
          program.push(i);
        }
        else if (i.data.displayCategory === 'gear') {
          gear.push(i);
        }
        else if (i.type === 'vehicle') {
          i.wt = Math.round(i.data.dur / 5);
          i.dr = Math.round(i.data.dur * 2);
          vehicle[i.data.type].push(i)
        }
      }

    for (let i of sheetData.items) {
        if (i.type === 'ware' && i.data.boundTo) {
            ware[i.data.boundTo].push(i);
        }
        else if (i.type === 'morphFlaw' && i.data.boundTo) {
            if (i.data.boundTo === "morph1"){
                morphtrait.present1 = true;
            }
            else if (i.data.boundTo === "morph2"){
                morphtrait.present2 = true;
            }
            else if (i.data.boundTo === "morph3"){
                morphtrait.present3 = true;
            }
            else if (i.data.boundTo === "morph4"){
                morphtrait.present4 = true;
            }
            else if (i.data.boundTo === "morph5"){
                morphtrait.present5 = true;
            }
            else if (i.data.boundTo === "morph6"){
                morphtrait.present6 = true;
            }
            morphflaw[i.data.boundTo].push(i);
        }
        else if (i.type === 'morphTrait' && i.data.boundTo) {
            if (i.data.boundTo === "morph1"){
                morphtrait.present1 = true;
            }
            else if (i.data.boundTo === "morph2"){
                morphtrait.present2 = true;
            }
            else if (i.data.boundTo === "morph3"){
                morphtrait.present3 = true;
            }
            else if (i.data.boundTo === "morph4"){
                morphtrait.present4 = true;
            }
            else if (i.data.boundTo === "morph5"){
                morphtrait.present5 = true;
            }
            else if (i.data.boundTo === "morph6"){
                morphtrait.present6 = true;
            }
            morphtrait[i.data.boundTo].push(i);
        }
    }
    actorData.showEffectsTab=false
    if(game.settings.get("eclipsephase", "effectPanel") && game.user.isGM){
      var effectList=this.actor.getEmbeddedCollection('ActiveEffect');
      for(let i of effectList){
        effects.push(i.data);
      }
      actorData.showEffectsTab=true;
    }

    // Assign and return
    actorData.trait = trait;
    actorData.flaw = flaw;
    actorData.morphTrait = morphtrait;
    actorData.morphFlaw = morphflaw;
    actorData.rangedWeapon = rangedweapon;
    actorData.ccweapon = ccweapon;
    actorData.armor = armor;
    actorData.ware = ware;
    actorData.aspect = aspect;
    actorData.program = program;
    actorData.gear = gear;
    actorData.knowSkill = know;
    actorData.specialSkill = special;
    actorData.vehicle = vehicle;
    actorData.activeEffects=effects;
    actorData.actorType = "PC";
    


    //console.log("What is actorData? ", actorData)
    //console.log("Normal Traits: ", actorData.trait)
    //console.log("Normal Flaws: ", actorData.flaw)

    //console.log("Morph Flaw Array", actorData.morphFlaw)
    // console.log("Morph Trait Array", actorData.morphTrait)
    //console.log("Ware Array", actorData.ware)

    //console.log("Morph Flaw Array 1 ", actorData.morphFlaw.morph1)
  }

  /* -------------------------------------------- */

  _onDrop

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;



    registerEffectHandlers(html,this.actor);
    registerCommonHandlers(html,this.actor);
   /* registerItemHandlers(html,this.actor,this);*/

   // Add Inventory Item
   html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

        // Delete Inventory Item
  html.find('.item-delete').click(ev => {
    const li = $(ev.currentTarget).parents(".item");
    this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
    li.slideUp(200, () => this.render(false));
  });


    // Rollable abilities.
    html.find('.task-check').click(this._onTaskCheck.bind(this));
    html.find('.damage-roll').click(this._onDamageRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
        let handler = ev => this._onDragItemStart(ev);
        html.find('li.item').each((i, li) => {
            if (li.classList.contains("inventory-header")) return;
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", handler, false);
        });
    }
      //Edit Item Input Fields
      html.find(".sheet-inline-edit").change(this._onSkillEdit.bind(this));

      //Change active/passive state of morph/body bound flaws
      html.find(".bodySelect").change(this._onMorphSwitch.bind(this));

      //Edit Item Checkboxes
      html.find('.equipped.checkBox').click(ev => {
          const itemId = ev.currentTarget.closest(".equipped.checkBox").dataset.itemId;
          const item = this.actor.items.get(itemId);
          let toggle = !item.data.data.active;
          const updateData = {
              "data.active": toggle
          };
          const updated = item.update(updateData);
          
          let effUpdateData=[];
          for(let eff of this.object.data.effects.filter(e => 
            (e.data.disabled === toggle && e.data.origin.indexOf(itemId)>=0))){

              effUpdateData.push({
                "_id" : eff.data._id,
                disabled: !toggle
              });
          }
          this.object.updateEmbeddedDocuments("ActiveEffect",effUpdateData);
      });

      //show on hover
      html.find(".reveal").on("mouseover mouseout", this._onToggleReveal.bind(this));

  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */

  _onMorphSwitch(event) {
    event.preventDefault();
    let itemTypes = this.actor.itemTypes;
    let mTraits = itemTypes.morphTrait;
    let mFlaws = itemTypes.morphFlaw;
    let mWare = itemTypes.ware;
    let mtToggle = null;
    let mfToggle = null;
    let mwToggle = null;
    let currentMorph = event.currentTarget.value;
    for (let trait of mTraits){
      if (trait.data.data.boundTo === currentMorph){
        mtToggle = true
      }
      else {
        mtToggle = false
      }
    let effUpdateData=[];
    for(let eff of this.object.data.effects.filter(e => 
      (e.data.disabled === mtToggle && e.data.origin.indexOf(trait.data._id)>=0))){
        console.log("These are the effects on this trait: ", this.object.data.effects)
        effUpdateData.push({
          "_id" : eff.data._id,
          disabled: !mtToggle
        });
    }
    this.object.updateEmbeddedDocuments("ActiveEffect",effUpdateData);
    }
    for (let flaw of mFlaws){
      if (flaw.data.data.boundTo === currentMorph){
        mfToggle = true
      }
      else {
        mfToggle = false
      }
    let effUpdateData=[];
    for(let eff of this.object.data.effects.filter(e => 
      (e.data.disabled === mfToggle && e.data.origin.indexOf(flaw.data._id)>=0))){

        effUpdateData.push({
          "_id" : eff.data._id,
          disabled: !mfToggle
        });
    }
    this.object.updateEmbeddedDocuments("ActiveEffect",effUpdateData);
    }
    for (let ware of mWare){
      if (ware.data.data.boundTo === currentMorph){
        mwToggle = true
      }
      else {
        mwToggle = false
      }
    let effUpdateData=[];
    for(let eff of this.object.data.effects.filter(e => 
      (e.data.disabled === mwToggle && e.data.origin.indexOf(ware.data._id)>=0))){

        effUpdateData.push({
          "_id" : eff.data._id,
          disabled: !mwToggle
        });
    }
    this.object.updateEmbeddedDocuments("ActiveEffect",effUpdateData);
    }
  }

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    
    delete itemData.data["type"];
    if (itemData.type === "specialSkill") {
      itemData.name = "New Skill";
    }
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */

  _onTaskCheck(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.actor.data.data;

    if(dataset.type === 'rep') {
      this._onRepRoll(dataset, actorData)
      return
    }

      Dice.TaskCheck ({
        skillName : dataset.name.toLowerCase(),
        specName : dataset.specname,
        rollType : dataset.type,
        skillValue : dataset.rollvalue,
        actorData : actorData,
        askForOptions : event.shiftKey,
        optionsSettings: game.settings.get("eclipsephase", "showTaskOptions"),
        brewStatus: game.settings.get("eclipsephase", "superBrew")
      });
    }

  _onDamageRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.actor.data.data;

      Dice.DamageRoll ({
        weaponName : dataset.weaponname,
        weaponDamage : dataset.roll,
        weaponType : dataset.type,
        actorData : actorData,
        askForOptions : event.shiftKey,
        optionsSettings: game.settings.get("eclipsephase", "showDamageOptions")
      });
  }

  _onSkillEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;

    return item.update({ [field]: element.value });
    }

    _onToggleReveal(event) {
      const reveals = event.currentTarget.getElementsByClassName("info");
      $.each(reveals, function (index, value){
        $(value).toggleClass("hidden");
      })
      const revealer = event.currentTarget.getElementsByClassName("toggle");
      $.each(revealer, function (index, value){
        $(value).toggleClass("noShow");
      })
    }


    _onRepRoll(dataset, actorData) {
      Dice.ReputationRoll(dataset, actorData)
    }

}


