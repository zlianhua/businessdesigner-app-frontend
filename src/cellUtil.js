import { timingSafeEqual } from 'crypto';

const _ = require('lodash');
export default {
  findCellById(cellId, cells){
    let returnCell = null;
    for (let cell of cells){
      if (cell.id === cellId){
        returnCell = cell;
        break;
      }
    }
    return returnCell;
  },
  isExtendsFrom(thisEntityId, anotherEntityId, entityMap, linkMap){
    let parentEntity = this.findParentEntity(thisEntityId, entityMap, linkMap);
    if (parentEntity){
      if (parentEntity.id === anotherEntityId){
        return true;
      } else {
        return this.isExtendsFrom(parentEntity.id, anotherEntityId, entityMap, linkMap);
      }
    } else {
      return false;
    }
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
  findParentRelateEntities: function(entity, relateEntities, entityMap, linkMap){
    relateEntities = this.findRelateEntities(entity, relateEntities, entityMap, linkMap);
    let parentEntity = this.findParentEntity(entity.id, entityMap, linkMap);
    if (parentEntity){
      relateEntities = this.findParentRelateEntities(parentEntity, relateEntities, entityMap, linkMap);
    }
    return relateEntities;
  },
  buildParentEntityName(relatesMap, entity, relateEntity, parentEntityName, entityMap, linkMap){
    if (relateEntity.parentEntity){
      let parentRelateEntity = relatesMap.get(relateEntity.parentEntity.name);
      if (parentRelateEntity){
        return this.buildParentEntityName(relatesMap, entity, parentRelateEntity, parentEntityName, entityMap, linkMap);
      }
      let isExtends = this.isExtendsFrom(entity.id, relateEntity.parentEntity.id, entityMap, linkMap);  
      if (isExtends){
        return parentEntityName;
      } else {
        return relateEntity.parentEntity.name + "." + parentEntityName;
      }
    }
  },
  findExternalClassAttributes(entity, attributes, entityMap, linkMap){
    for (let [, v] of linkMap){
      if (v.targetId === entity.id){
        let source = entityMap.get(v.sourceId);
        if (source.type === "uml.ExternalClass"){
          let attrName = source.name;
          let idx = attrName.lastIndexOf(".") + 1;
          attrName = attrName.substr(idx);
          attrName = attrName.charAt(0).toLowerCase() + attrName.substr(1) + "Id";
          
          if (v.type === "Aggregation" || v.type === "Composition"){
            attrName = attrName + "List";          
          }
          let hasThisAttr = false;
          for (let aAttr of attributes){
            if (aAttr.name === attrName){
              hasThisAttr = true;
              break;
            }
          }
          if (!hasThisAttr){
            let attr = {}
            attr.name = attrName;
            attr.type = "Long";
            attributes.push(attr);
          }
        }
      }
    }
    return attributes;
  },
  createParameters(editClass, entityMap, linkMap){
    var parameters = [];
    var attributes = [];
    for (let attr of editClass.attributes){
      attributes.push(attr);
    }
    attributes = this.findExternalClassAttributes(editClass, attributes, entityMap, linkMap);
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
    let parentEntity = this.findParentEntity(editClass.id, entityMap, linkMap);
    if (parentEntity){
      relateEntities = this.findParentRelateEntities(parentEntity, relateEntities, entityMap, linkMap);
    }
    var relatesMap = new Map();
    for (let aRel of relateEntities){
      relatesMap.set(aRel.entity.name, aRel);
    }
    for (let relatEntity of relateEntities){
      var parentEntityName = "";
      if (relatEntity.parentEntity){
        parentEntityName = this.buildParentEntityName(relatesMap, editClass, relatEntity, parentEntityName, entityMap, linkMap);
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
          let key = param.name;
          if (param.relateName){
            key = param.relateName;
          }
          paramMap.set(key, param);
        }
        aCommandService.parameters = [];
        for (let aParam of parameters){
          let key = aParam.name;
          if (aParam.relateName){
            key = aParam.relateName;
          }
          let existParam = paramMap.get(key);
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
