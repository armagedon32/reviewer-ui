import csv
import random
from pathlib import Path


random.seed(42)

SUBJECTS = ["FAR", "AFAR", "Auditing", "MAS", "RFBT", "Taxation"]
DIFFICULTY_SPLIT = [("Hard", 70), ("Medium", 20), ("Easy", 10)]
TOTAL_PER_SUBJECT = 100


def make_options(correct_value, style="number"):
    if style == "number":
        c = round(float(correct_value), 2)
        deltas = [0, round(c * 0.05 or 1, 2), round(c * 0.1 or 2, 2), round(c * 0.15 or 3, 2)]
        values = [c, round(c + deltas[1], 2), round(max(0, c - deltas[2]), 2), round(c + deltas[3], 2)]
        random.shuffle(values)
        labels = ["A", "B", "C", "D"]
        options = dict(zip(labels, [f"{v:,.2f}" for v in values]))
        answer = labels[[options[l] for l in labels].index(f"{c:,.2f}")]
        return options, answer

    labels = ["A", "B", "C", "D"]
    choices = [correct_value]
    distractors = [
        "Only when cash is collected",
        "At period-end adjusting entry",
        "When approved by management",
        "When legally enforceable only",
    ]
    while len(choices) < 4:
        pick = random.choice(distractors)
        if pick not in choices:
            choices.append(pick)
    random.shuffle(choices)
    options = dict(zip(labels, choices))
    answer = labels[choices.index(correct_value)]
    return options, answer


def far_problem(idx, difficulty):
    units = random.randint(120, 500)
    price = random.randint(1100, 3500)
    vat = 1.12
    total = units * price
    if difficulty == "Hard":
        discount = random.choice([0.03, 0.05, 0.08])
    elif difficulty == "Medium":
        discount = random.choice([0.02, 0.03])
    else:
        discount = 0.0
    net = total * (1 - discount)
    vat_amount = net - (net / vat)
    correct = round(vat_amount, 2)
    q = (
        f"A company sold {units} units at PHP {price:,.2f} VAT-inclusive per unit with "
        f"{discount*100:.0f}% trade discount. Compute output VAT."
    )
    options, ans = make_options(correct, "number")
    return "Revenue Recognition and VAT", q, options, ans


def afar_problem(idx, difficulty):
    amount_fc = random.randint(50000, 300000)
    rate_txn = random.uniform(54.0, 58.0)
    rate_settle = rate_txn + random.uniform(-1.8, 1.8)
    php_txn = amount_fc * rate_txn
    php_settle = amount_fc * rate_settle
    gain_loss = round(php_settle - php_txn, 2)
    q = (
        f"An import payable of USD {amount_fc:,.0f} was recorded at PHP {rate_txn:.2f}/USD and settled "
        f"at PHP {rate_settle:.2f}/USD. Compute foreign exchange gain (loss)."
    )
    options, ans = make_options(gain_loss, "number")
    return "Foreign Currency Transactions", q, options, ans


def auditing_problem(idx, difficulty):
    pop = random.randint(800000, 3000000)
    if difficulty == "Hard":
        pct = random.choice([0.5, 0.7, 1.0])
    elif difficulty == "Medium":
        pct = random.choice([1.0, 1.5])
    else:
        pct = random.choice([1.5, 2.0])
    materiality = round(pop * (pct / 100), 2)
    q = (
        f"Audit planning benchmark: if materiality is set at {pct:.1f}% of base amount "
        f"PHP {pop:,.2f}, compute planning materiality."
    )
    options, ans = make_options(materiality, "number")
    return "Audit Planning and Materiality", q, options, ans


def mas_problem(idx, difficulty):
    fixed = random.randint(120000, 420000)
    price = random.randint(180, 750)
    variable = random.randint(90, int(price * 0.8))
    target_profit = random.randint(40000, 180000) if difficulty != "Easy" else 0
    denom = price - variable
    breakeven = round((fixed + target_profit) / denom, 2)
    q = (
        f"A product sells at PHP {price:,.2f} with variable cost PHP {variable:,.2f} and fixed costs "
        f"PHP {fixed:,.2f}. Target profit is PHP {target_profit:,.2f}. Compute required units."
    )
    options, ans = make_options(breakeven, "number")
    return "Cost-Volume-Profit Analysis", q, options, ans


def rfbt_problem(idx, difficulty):
    templates = [
        ("A contract requires consent, object, and cause to be valid.", "At period-end adjusting entry"),
        ("A negotiable instrument must be in writing and signed by maker/drawer.", "When approved by management"),
        ("Corporate powers are exercised by the board as a body.", "Only when cash is collected"),
    ]
    base, wrong = random.choice(templates)
    question = f"Which statement is legally correct under Philippine commercial/corporate law? {base}"
    options, ans = make_options(base, "text")
    return "Obligations, Contracts, and Corporation Law", question, options, ans


def tax_problem(idx, difficulty):
    taxable_income = random.randint(350000, 2500000)
    rate = random.choice([0.2, 0.25, 0.3])
    tax_due = round(taxable_income * rate, 2)
    q = (
        f"A taxpayer has taxable income of PHP {taxable_income:,.2f}. Using a flat rate of "
        f"{rate*100:.0f}% for this item, compute income tax due."
    )
    options, ans = make_options(tax_due, "number")
    return "Income Taxation", q, options, ans


GENERATOR = {
    "FAR": far_problem,
    "AFAR": afar_problem,
    "Auditing": auditing_problem,
    "MAS": mas_problem,
    "RFBT": rfbt_problem,
    "Taxation": tax_problem,
}


def generate_rows():
    rows = []
    for subject in SUBJECTS:
        idx = 1
        for difficulty, count in DIFFICULTY_SPLIT:
            for _ in range(count):
                topic, question, options, answer = GENERATOR[subject](idx, difficulty)
                rows.append(
                    {
                        "exam_type": "CPA",
                        "subject": subject,
                        "topic": topic,
                        "difficulty": difficulty,
                        "question": question,
                        "a": options["A"],
                        "b": options["B"],
                        "c": options["C"],
                        "d": options["D"],
                        "answer": answer,
                    }
                )
                idx += 1
    return rows


def main():
    rows = generate_rows()
    assert len(rows) == len(SUBJECTS) * TOTAL_PER_SUBJECT
    out_path = Path(__file__).resolve().parents[1] / "cpa_question_bank_600.csv"
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "exam_type",
                "subject",
                "topic",
                "difficulty",
                "question",
                "a",
                "b",
                "c",
                "d",
                "answer",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated: {out_path}")
    print(f"Rows: {len(rows)}")


if __name__ == "__main__":
    main()
