/* eslint-env node */
/* global module */

/**
 * jscodeshift codemod scaffold: replace hard-coded /admin/... or /site/<slug>/... route literals
 * with buildEntityUrl(entity, id?, { mode, siteSlug }) calls.
 *
 * NOTE: This is a best-effort scaffold. Manual review will be required for complex concatenations
 * and template literal shapes. Run with:
 *   npx jscodeshift -t transforms/replace-admin-site-routes.js src --parser=ts
 */

const ADMIN_ROUTE_REGEX = /^\/admin(\/[a-zA-Z0-9\-_/]*)?$/
const SITE_ROUTE_REGEX = /^\/site\//
const ENTITY_EXTRACT_REGEX = /^\/(admin|site)\/([^/"]+)/

module.exports = function transformer(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)

  // Replace simple string literals like "/admin/users/" with a call buildEntityUrl('users')
  root
    .find(j.Literal, (lit) => {
      return (
        typeof lit.value === 'string' &&
        (ADMIN_ROUTE_REGEX.test(lit.value) || SITE_ROUTE_REGEX.test(lit.value))
      )
    })
    .forEach((p) => {
      const val = p.node.value
      // Attempt to parse entity from path
      const match = val.match(ENTITY_EXTRACT_REGEX)
      if (!match) return
      const entity = match[2]
      // Replace with a call expression: buildEntityUrl('entity')
      const call = j.callExpression(j.identifier('buildEntityUrl'), [j.literal(entity)])
      j(p).replaceWith(call)
    })

  return root.toSource({ quote: 'single' })
}
