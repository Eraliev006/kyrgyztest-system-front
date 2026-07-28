import random


def candidate_payload(**overrides) -> dict:
    inn = ''.join(random.choices('0123456789', k=14))
    payload = {
        'fullName': f'AUTO-QA {inn[:6]}',
        'inn': inn,
        'organizationId': None,
    }
    payload.update(overrides)
    return payload
