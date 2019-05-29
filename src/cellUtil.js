const _ = require('lodash');
export default {
  findCellById(cellId, cells){
    var returnCell = null;
    _.each(cells, function(cell) {
      if (cell.id === cellId){
        returnCell = cell;
        return returnCell;
      }
    });
    return returnCell;
  },
  findParentEntity: function(entityId, entityMap, linkMap){
    let parentEntity = null;
    for (let [, v] of linkMap){
      if (v.sourceId === entityId && v.type === "Generalization"){
        parentEntity = entityMap.get(v.targetId);
        return parentEntity;
      }
    }
    return parentEntity;
  },

  findAttributesOfSuper: function(entityId, attributes, isAddSuperAttr, entityMap, linkMap){
    let parent = this.findParentEntity(entityId, entityMap, linkMap);
    if (parent != null){
      attributes = this.findAttributesOfSuper(parent.id, attributes, true, entityMap, linkMap);
    }
    if (isAddSuperAttr){
      let entity = entityMap.get(entityId);
      for (let attr of entity.attributes){
        attr.superEntityName = entity.name;
      }
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
        relateEntities = this.findRelateEntities(source, relateEntities, entityMap, linkMap);
      }
    }
    return relateEntities;
  },
  buildParentEntityName(relatesMap, relateEntity, parentEntityName){
    if (relateEntity.parentEntity){
      let parentRelateEntity = relatesMap.get(relateEntity.parentEntity.name);
      if (parentRelateEntity){
        return this.buildParentEntityName(relatesMap, parentRelateEntity, parentEntityName);
      }
      return relateEntity.parentEntity.name + "." + parentEntityName;
    }
  },
  createParameters(editClass, entityMap, linkMap){
    var parameters = [];
    var attributes = editClass.attributes;
    attributes = this.findAttributesOfSuper(editClass.id, attributes, false, entityMap, linkMap);
    _.each(attributes, function(attr){
      if (!attr.isPrimary){
        var enums = [];
        if (attr.attrEnum){
          enums = attr.attrEnum.enums;
        }
        var parameter = {
          isParameter:false,
          relateName:"",
          name:attr.name,
          type:attr.type,
          valueFrom:"",
          value:"",
          enums:enums
        }
        if (attr.superEntityName){
          parameter.superEntityName = attr.superEntityName;
        }
        parameters.push(parameter);
      }
    });
    var relateEntities = [];
    relateEntities = this.findRelateEntities(editClass, relateEntities, entityMap, linkMap);
    var relatesMap = new Map();
    for (let aRel of relateEntities){
      relatesMap.set(aRel.entity.name, aRel);
    }
    for (let relatEntity of relateEntities){
      var parentEntityName = "";
      if (relatEntity.parentEntity){
        parentEntityName = this.buildParentEntityName(relatesMap, relatEntity, parentEntityName);
      }
      if (parentEntityName && parentEntityName !== "" && !parentEntityName.endsWith(".")){
        parentEntityName += ".";
      }
      for (let attr of relatEntity.entity.attributes){
        if (attr.isPrimary){
          continue;
        }
        if (attr.name && attr.name !== ""){
          var relateName = parentEntityName + relatEntity.entity.name + "." + attr.name;
          var enums = [];
          if (attr.attrEnum){
            enums = attr.attrEnum.enums;
          }
          var parameter = {
            isParameter:false,
            relateName:relateName,
            name:attr.name,
            type:attr.type,
            valueFrom:"",
            value:"",
            enums:enums
          }
          parameters.push(parameter);
        }
      }
    }
    return parameters;
  },
  restoreCommandServices(entity, entityMap, linkMap){
    let commandServices = entity.commandServices;
    if (commandServices != null && commandServices.length > 0){
      for (let aCommandService of commandServices){
        let parameters = this.createParameters(entity, entityMap, linkMap);
        let paramMap = new Map();
        for (let param of aCommandService.parameters){
          param.isParameter = true;
          paramMap.set(param.name, param);
        }
        aCommandService.parameters = [];
        for (let aParam of parameters){
          let existParam = paramMap.get(aParam.name);
          if (existParam != null){
            aParam.isParameter = true;
            aParam.type = existParam.type;
            aParam.valueFrom = existParam.valueFrom;
            aParam.value = existParam.value;
            aParam.relateName = existParam.relateName;
          }
          aCommandService.parameters.push(aParam);
        }
      }
    }
  },
  restoreQueryServices(newEntity, entityMap, linkMap){
    let attributes = newEntity.attributes;
    let queryServices = newEntity.queryServices;
    attributes = this.findAttributesOfSuper(newEntity.id, attributes, false, entityMap, linkMap);
    if (queryServices != null && queryServices.length > 0){
      for (let queryService of queryServices){
        let parametersMap = new Map();
        for (let param of queryService.parameters){
          parametersMap.set(param.name, param);
        }
        for (let aAttr of attributes){
          let aParameter = parametersMap.get(aAttr.name);
          if (!aParameter){
            aParameter = {};
            aParameter.name = aAttr.name;
            aParameter.isParameter = false;
            aParameter.type = aAttr.type;
            aParameter.options = [];
            aParameter.condition = "";
            aParameter.relation = "";
            aParameter.sort = "";
            aParameter.isNullable = false;
            queryService.parameters.push(aParameter);
          }
        }
      }
    }
  },
  downloadFile(content, fileName){
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  },
  findAttributeByName(entity, attrName, entityMap, linkMap){
    let retAttr = null;
    let attributes = entity.attributes;
    attributes = this.findAttributesOfSuper(entity.id, attributes, false, entityMap, linkMap);
    for (let attr of attributes){
      if (attr.name === attrName){
        retAttr = attr;
        break;
      }
    }
    return retAttr;
  },
  findEntityBySimpleName(entityMap, entitySimpleName){
    let retEntity = null;
    for (let [, v] of entityMap){
      if (v.name === entitySimpleName){
        retEntity = v;
        break;
      }
    }
    return retEntity;
  }

}
