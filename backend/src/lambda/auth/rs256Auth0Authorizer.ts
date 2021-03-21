
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJEWIect7316HdMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi11bzk0YWt4Zi51cy5hdXRoMC5jb20wHhcNMjEwMzIwMTU0NTMzWhcN
MzQxMTI3MTU0NTMzWjAkMSIwIAYDVQQDExlkZXYtdW85NGFreGYudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwXZIpPJp+3q94BiL
pDKQn/RkvXc63kShhbyWRrqktlwTawdVp492N0KnIqROp99NTwBaoD9ZgI/8JRxW
N5RiUO5146Vp8Zzv3JjOQ9vw3WjktkWWC3vYVK8IjqdiSBvkhN5tDBUjXs6DPXVJ
IWDvXd/uAELkE/UET8yozgvnZu7eQj1aHH6IdV88vXDyzxLFvqsO9qtNm1sqNjDc
wNoSmcACWaUimAfYuyornbhpI0h8gv9GSlDvHLUJIrymlv8vy4Z78drsREVQeOod
sE8lhv0kZQmDdHUV9+XMKpR18vqaVzefbbXahDeGmaSB/1R6NUDvPFAABTv9g4y5
0ypgtwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTjpQJEvM9E
tDzD6AL3aME5js/DizAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGAaNKCda/rbxSrYwHppVS2z3KEPxH4WvJ4bNQASWCrElpPrKSOpfXc1GR0xEkS7
ZuuiY7zMLEj2AMzK2OMOZDvDxZK9mJ6ZOeMWAxh8ihnn9hl6ieRg9+UVDvFq6rPN
iEUg259Ul5qFK/Z98HjWCkUy5/xjLswRl0BDHSl+oRysgPKzvXP1CBXRA3UyRBZY
l5Mw74hXqcV/ei7hIU+9QZFdF5IBz3us2WQ9i3wIpxkSSL9bVD9ChKEI8tMxrFhh
4qrq583Vq/tbUck7sd0hqM4UKLQBKux20L8qabhM/8P8nmvuSE5nGcoH6v0f1V3Z
GF+schi908uaKK7pYHSvGNo=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
