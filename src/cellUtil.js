export default {
  findParentEntity: function(entityId, entityMap, linkMap){
    for (let [, v] of linkMap){
      if (v.sourceId === entityId && v.type === "Generalization"){
        return entityMap.get(v.targetId);
      }
    }
    return null;
  },

  findAttributesOfSuper: function(entityId, attributes, isAddSuperAttr, entityMap, linkMap){
    let parent = this.findParentEntity(entityId, entityMap, linkMap);
    if (parent != null){
      attributes = this.findAttributesOfSuper(parent.id, attributes, true);
    }
    if (isAddSuperAttr){
      let entity = entityMap.get(entityId);
      attributes = entity.attributes.concat(attributes);
    }
    return attributes;
  },

  findRelateEntities: function(entity, relateEntities, entityMap, linkMap){
    for (let [, v] of linkMap){
      if (v.targetId === entity.id && (v.type === "Aggregation" || v.type === "Composition")){
        let source = entityMap.get(v.sourceId);
        let relateEntity = {
          entity:source,
          parentEntity:entity
        }
        relateEntities.push(relateEntity);
        relateEntities = this.findRelateEntities(source, relateEntities);
      }
    }
    return relateEntities;
  }
}
