/* tslint:disable */
/* eslint-disable */
/**
 * Task Management Service
 * API for managing tasks for patients, doctors, and administrators.
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface ConsultationType
 */
export interface ConsultationType {
    /**
     * 
     * @type {string}
     * @memberof ConsultationType
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ConsultationType
     */
    type?: string;
    /**
     * 
     * @type {string}
     * @memberof ConsultationType
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof ConsultationType
     */
    price?: number;
    /**
     * 
     * @type {string}
     * @memberof ConsultationType
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof ConsultationType
     */
    updatedAt?: string;
}

/**
 * Check if a given object implements the ConsultationType interface.
 */
export function instanceOfConsultationType(value: object): value is ConsultationType {
    return true;
}

export function ConsultationTypeFromJSON(json: any): ConsultationType {
    return ConsultationTypeFromJSONTyped(json, false);
}

export function ConsultationTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): ConsultationType {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'type': json['type'] == null ? undefined : json['type'],
        'description': json['description'] == null ? undefined : json['description'],
        'price': json['price'] == null ? undefined : json['price'],
        'createdAt': json['createdAt'] == null ? undefined : json['createdAt'],
        'updatedAt': json['updatedAt'] == null ? undefined : json['updatedAt'],
    };
}

export function ConsultationTypeToJSON(json: any): ConsultationType {
    return ConsultationTypeToJSONTyped(json, false);
}

export function ConsultationTypeToJSONTyped(value?: ConsultationType | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'type': value['type'],
        'description': value['description'],
        'price': value['price'],
        'createdAt': value['createdAt'],
        'updatedAt': value['updatedAt'],
    };
}

