<?php
/**
 * Plugin Name: Genfinity API Bridge
 * Description: Secure REST API bridge for managing Genfinity WordPress content from approved integrations.
 * Version: 1.0.0
 * Author: Genfinity O&P
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Genfinity_API_Bridge {
    private const OPTION_KEY = 'genfinity_api_bridge_key';
    private const REST_NAMESPACE = 'genfinity/v1';

    public static function init(): void {
        add_action('admin_menu', [__CLASS__, 'admin_menu']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    public static function activate(): void {
        if (!get_option(self::OPTION_KEY)) {
            add_option(self::OPTION_KEY, wp_generate_password(48, false, false), '', false);
        }
    }

    public static function admin_menu(): void {
        add_options_page(
            'Genfinity API Bridge',
            'Genfinity API Bridge',
            'manage_options',
            'genfinity-api-bridge',
            [__CLASS__, 'settings_page']
        );
    }

    public static function register_settings(): void {
        register_setting('genfinity_api_bridge', self::OPTION_KEY, [
            'type' => 'string',
            'sanitize_callback' => static function ($value): string {
                return preg_replace('/[^A-Za-z0-9._~-]/', '', (string) $value);
            },
            'default' => '',
        ]);
    }

    public static function settings_page(): void {
        if (!current_user_can('manage_options')) {
            return;
        }
        $key = (string) get_option(self::OPTION_KEY, '');
        ?>
        <div class="wrap">
            <h1>Genfinity API Bridge</h1>
            <p>Use this key only with trusted integrations. Requests must send it in the <code>X-Genfinity-API-Key</code> header.</p>
            <form method="post" action="options.php">
                <?php settings_fields('genfinity_api_bridge'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="genfinity_api_bridge_key">API key</label></th>
                        <td>
                            <input name="<?php echo esc_attr(self::OPTION_KEY); ?>" id="genfinity_api_bridge_key" type="text" class="regular-text code" value="<?php echo esc_attr($key); ?>" autocomplete="off" />
                            <p class="description">Regenerating this key immediately invalidates the previous key.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save API key'); ?>
            </form>
            <h2>Available endpoints</h2>
            <ul>
                <li><code>GET /wp-json/genfinity/v1/health</code></li>
                <li><code>POST /wp-json/genfinity/v1/posts</code></li>
                <li><code>POST /wp-json/genfinity/v1/media</code></li>
            </ul>
            <p>For maximum compatibility, the native WordPress REST API and Application Passwords remain supported.</p>
        </div>
        <?php
    }

    private static function authorized(WP_REST_Request $request): bool {
        $provided = (string) $request->get_header('X-Genfinity-API-Key');
        $expected = (string) get_option(self::OPTION_KEY, '');
        return $provided !== '' && $expected !== '' && hash_equals($expected, $provided);
    }

    public static function register_routes(): void {
        register_rest_route(self::REST_NAMESPACE, '/health', [
            'methods' => WP_REST_Server::READABLE,
            'permission_callback' => [__CLASS__, 'authorized'],
            'callback' => static function (): WP_REST_Response {
                return new WP_REST_Response([
                    'ok' => true,
                    'site' => get_bloginfo('name'),
                    'url' => home_url('/'),
                    'wordpress_version' => get_bloginfo('version'),
                ]);
            },
        ]);

        register_rest_route(self::REST_NAMESPACE, '/posts', [
            'methods' => WP_REST_Server::CREATABLE,
            'permission_callback' => [__CLASS__, 'authorized'],
            'callback' => [__CLASS__, 'create_post'],
            'args' => [
                'title' => ['required' => true, 'type' => 'string'],
                'content' => ['required' => true, 'type' => 'string'],
                'status' => ['type' => 'string', 'default' => 'draft', 'enum' => ['draft', 'pending', 'publish', 'private']],
                'excerpt' => ['type' => 'string'],
                'slug' => ['type' => 'string'],
                'featured_media' => ['type' => 'integer'],
                'categories' => ['type' => 'array', 'items' => ['type' => 'integer']],
                'tags' => ['type' => 'array', 'items' => ['type' => 'integer']],
            ],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/media', [
            'methods' => WP_REST_Server::CREATABLE,
            'permission_callback' => [__CLASS__, 'authorized'],
            'callback' => [__CLASS__, 'upload_media'],
        ]);
    }

    public static function create_post(WP_REST_Request $request) {
        $post_id = wp_insert_post(wp_slash([
            'post_type' => 'post',
            'post_title' => $request->get_param('title'),
            'post_content' => $request->get_param('content'),
            'post_status' => $request->get_param('status') ?: 'draft',
            'post_excerpt' => $request->get_param('excerpt') ?: '',
            'post_name' => $request->get_param('slug') ?: '',
        ]), true);
        if (is_wp_error($post_id)) {
            return $post_id;
        }
        if ($request->get_param('featured_media')) {
            set_post_thumbnail($post_id, absint($request->get_param('featured_media')));
        }
        if (is_array($request->get_param('categories'))) {
            wp_set_post_categories($post_id, array_map('absint', $request->get_param('categories')));
        }
        if (is_array($request->get_param('tags'))) {
            wp_set_post_tags($post_id, array_map('absint', $request->get_param('tags')));
        }
        return new WP_REST_Response([
            'id' => $post_id,
            'status' => get_post_status($post_id),
            'link' => get_permalink($post_id),
        ], 201);
    }

    public static function upload_media(WP_REST_Request $request) {
        $files = $request->get_file_params();
        if (empty($files['file']) || !empty($files['file']['error'])) {
            return new WP_Error('missing_file', 'Send a multipart file field named file.', ['status' => 400]);
        }
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $attachment_id = media_handle_upload('file', 0);
        if (is_wp_error($attachment_id)) {
            return $attachment_id;
        }
        if ($request->get_param('alt_text')) {
            update_post_meta($attachment_id, '_wp_attachment_image_alt', sanitize_text_field($request->get_param('alt_text')));
        }
        return new WP_REST_Response([
            'id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id),
        ], 201);
    }
}

register_activation_hook(__FILE__, ['Genfinity_API_Bridge', 'activate']);
Genfinity_API_Bridge::init();
