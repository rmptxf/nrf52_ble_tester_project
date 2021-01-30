/*
 * ble_cus.h file for the custom ble service.
 *
 * Author : Abdelali Boussetta  github/rmptxf
 * Date : 01/30/2019
 *
 */

#include <stdint.h>
#include "ble.h"
#include "ble_srv_common.h"
#include "sdk_common.h"
#include "app_error.h"

#define BLE_CUS_BLE_OBSERVER_PRIO  2

/**@brief   Macro for defining a ble_cus instance.
 *
 * @param   _name   Name of the instance.
 */
#define BLE_CUS_DEF(_name)                                                            \
static ble_cus_t _name;                                                               \
NRF_SDH_BLE_OBSERVER(_name ## _obs,                                                   \
                     BLE_CUS_BLE_OBSERVER_PRIO,                                       \
                     ble_cus_on_ble_evt, &_name)



#define CUS_SERVICE_UUID_BASE      { 0x22, 0x21, 0x20, 0x19, 0x18, 0x17, 0x16, 0x15, \
                                     0x14, 0x13, 0x12, 0x11, 0x00, 0x00, 0x00, 0x00 }

#define CUS_SERVICE_UUID           0x1000

#define BUTTONS_STATES_CHAR_UUID   0x1001 
#define POTENTIO_LEVEL_CHAR_UUID   0x1002	
#define LEDS_STATES_CHAR_UUID      0x1003	

/**@brief Custom service event types.
 *
 */
typedef enum
{   
    BLE_BUTTONS_STATES_CHAR_NOTIFICATIONS_ENABLED,
    BLE_BUTTONS_STATES_CHAR_NOTIFICATIONS_DISABLED,

    BLE_POTENTIO_LEVEL_CHAR_NOTIFICATIONS_ENABLED,
    BLE_POTENTIO_LEVEL_CHAR_NOTIFICATIONS_DISABLED,

    BLE_LEDS_STATES_CHAR_EVT_COMMAND_RX 

} ble_cus_evt_type_t;

/**@brief leds new states structure.
 * @details This structure is passed to an event when @ref BLE_CUS_EVT_COMMAND_RX occurs.
 */
typedef struct 
{
    uint8_t const * p_data;   
    uint16_t        length;  
} leds_new_states_t;


typedef struct
{
   ble_cus_evt_type_t evt_type;                     

   union
   {
       leds_new_states_t command_data;
       
   } params_command;

} ble_cus_evt_t;


/**@brief Forward declaration of the ble_cus_t type. */
typedef struct ble_cus_s ble_cus_t;


/**@brief Custom service event handler type. */
typedef void (*ble_cus_evt_handler_t) (ble_cus_t * p_cus, ble_cus_evt_t * p_evt);


/**@brief Custom Service init structure. 
 * This contains all options needed for the initialization of the service.
 *
 */
typedef struct
{
    ble_cus_evt_handler_t         evt_handler;                    /**< Event handler to be called for handling events in the Custom Service. */  
   
    ble_srv_cccd_security_mode_t  buttons_states_char_attr_md;    /**< Used to set the security mode of the cccd for the buttons char. */
    ble_srv_cccd_security_mode_t  potentio_level_char_attr_md;    /**< Used to set the security mode of the cccd for the potentio char. */

} ble_cus_init_t;


/**@brief Custom Service structure.
 *        This contains various status information for the service.
 */

struct ble_cus_s
{
    ble_cus_evt_handler_t         evt_handler;                    /**< Event handler to be called for handling events in the Custom Service. */
    uint16_t                      service_handle;                 /**< Handle of Custom Service (as provided by the BLE stack). */
   
    ble_gatts_char_handles_t      buttons_states_char_handles;    /**< Handles related to the buttons states characteristic. */
    ble_gatts_char_handles_t      leds_states_char_handles;       /**< Handles related to the leds states characteristic. */
    ble_gatts_char_handles_t      potentio_level_char_handles;    /**< Handles related to the potentio level characteristic. */
      
    uint16_t                      conn_handle;                    /**< Handle of the current connection (as provided by the BLE stack, is BLE_CONN_HANDLE_INVALID if not in a connection). */
    uint8_t                       uuid_type;                      /**< Holds the service uuid type. */
};


/**@brief Function for handling the Custom service ble events.
 *
 * @param[in]   p_ble_evt   Event received from the BLE stack.
 */
void ble_cus_on_ble_evt( ble_evt_t const * p_ble_evt, void * p_context);


/**@brief Function for initializing the Custom ble service.
 *
 * @param[in]   p_cus       Custom service structure.
 * @param[in]   p_cus_init  Information needed to initialize the service.
 *
 * @return      NRF_SUCCESS on success, otherwise an error code.
 */
uint32_t ble_cus_init(ble_cus_t * p_cus, const ble_cus_init_t * p_cus_init);


/**@brief Function for updating the potentio level value on the potentio ble characteristic.
 *
 * @param[in]   p_cus           Custom service structure.
 * @param[in]   potentio_level  Potentiometer level.
 * @param[in]   conn_handle     Connection handle.
 *
 * @return      NRF_SUCCESS on success, otherwise an error code.
 */

uint32_t ble_cus_potentio_level_update(ble_cus_t * p_cus, uint8_t potentio_level, uint16_t conn_handle);


/**@brief Function for updating the buttons states on the buttons ble characteristic.
 *
 * @param[in]   p_cus             Custom service structure.
 * @param[in]   p_buttons_states  Buttons states.
 * @param[in]   conn_handle       Connection handle.
 *
 * @return      NRF_SUCCESS on success, otherwise an error code.
 */
uint32_t ble_cus_buttons_states_update(ble_cus_t * p_cus, uint8_t  * p_buttons_states, uint16_t conn_handle);
